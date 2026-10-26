import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalZones,
      zones,
      activeAlerts,
      emergencyIncidents,
      activeFieldTeams,
      emergencyUnits,
      latestAlerts,
      latestIncidents,
      weather,
    ] = await Promise.all([
      prisma.zone.count(),
      prisma.zone.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          capacity: true,
          currentCrowd: true,
          density: true,
          riskLevel: true,
          riskScore: true,
          status: true,
          latitude: true,
          longitude: true,
          inflowRate: true,
          outflowRate: true,
        },
      }),
      prisma.alert.count({
        where: {
          status: { in: ['NEW', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS'] },
        },
      }),
      prisma.incident.count({
        where: {
          status: { in: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'] },
        },
      }),
      prisma.emergencyTeam.count({
        where: {
          status: { in: ['AVAILABLE', 'ASSIGNED', 'ON_SCENE', 'EN_ROUTE'] },
        },
      }),
      prisma.emergencyUnit.count({
        where: {
          status: { in: ['AVAILABLE', 'BUSY', 'DISPATCHED'] },
        },
      }),
      prisma.alert.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTeam: true,
          zone: true,
        },
      }),
      prisma.incident.findMany({
        take: 6,
        orderBy: { reportedAt: 'desc' },
        include: {
          assignedTeam: true,
          assignedUnit: true,
          zone: true,
        },
      }),
      prisma.weatherData.findFirst({
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    const totalEstimatedCrowd = zones.reduce((acc, z) => acc + z.currentCrowd, 0);
    const highRiskZones = zones.filter((z) => z.riskLevel === 'HIGH' || z.riskLevel === 'CRITICAL').length;
    const criticalAlertsCount = await prisma.alert.count({
      where: {
        severity: 'CRITICAL',
        status: { in: ['NEW', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS'] },
      },
    });

    // Aggregated incident categories
    const incidentsByCategory = await prisma.incident.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    // Time-series crowd density trend (last 12 samples from Sangam Ghat)
    const recentHistory = await prisma.crowdData.findMany({
      where: { zone: { code: 'ZONE-SANGAM' } },
      take: 12,
      orderBy: { timestamp: 'desc' },
    });

    const timeSeriesData = recentHistory.reverse().map((h) => ({
      time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      density: h.densityPercent,
      crowd: h.crowdCount,
      inflow: h.inflowRate,
      outflow: h.outflowRate,
      risk: h.riskScore,
    }));

    return res.json({
      kpis: {
        totalActiveZones: totalZones,
        totalPeopleEstimated: totalEstimatedCrowd,
        highRiskZones: highRiskZones,
        activeAlerts: activeAlerts,
        criticalAlertsCount,
        emergencyIncidents: emergencyIncidents,
        fieldTeamsActive: activeFieldTeams,
        emergencyUnitsActive: emergencyUnits,
      },
      zones,
      liveAlerts: latestAlerts,
      recentIncidents: latestIncidents,
      weather: weather || {
        temperature: 31.5,
        humidity: 62,
        rainMm: 0,
        windSpeedKmh: 12,
        condition: 'Clear Sky',
        weatherRisk: 'LOW',
      },
      analytics: {
        timeSeries: timeSeriesData,
        incidentsByCategory: incidentsByCategory.map((c) => ({
          name: c.category,
          count: c._count.category,
        })),
        zonePopulation: zones.map((z) => ({
          name: z.name.replace('Sector ', 'Sec ').replace(' & ', '/'),
          crowd: z.currentCrowd,
          capacity: z.capacity,
          density: z.density,
          risk: z.riskScore,
          riskLevel: z.riskLevel,
        })),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
