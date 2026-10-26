import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { evaluateCrowdRisk } from '../services/riskService';
import { emitSocketEvent } from '../socket';

export const getLiveCrowd = async (_req: Request, res: Response) => {
  try {
    const zones = await prisma.zone.findMany({
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
        inflowRate: true,
        outflowRate: true,
        movementDirection: true,
        updatedAt: true,
      },
      orderBy: { density: 'desc' },
    });

    const totalHeadcount = zones.reduce((sum, z) => sum + z.currentCrowd, 0);
    const avgDensity = Math.round((zones.reduce((sum, z) => sum + z.density, 0) / zones.length) * 10) / 10;

    return res.json({
      totalHeadcount,
      avgDensity,
      zones,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getCrowdHistory = async (req: Request, res: Response) => {
  try {
    const { zoneId, limit } = req.query;
    const take = limit ? parseInt(limit as string, 10) : 30;

    const whereClause: any = {};
    if (zoneId) {
      whereClause.zoneId = zoneId as string;
    }

    const history = await prisma.crowdData.findMany({
      where: whereClause,
      take,
      orderBy: { timestamp: 'desc' },
      include: {
        zone: { select: { name: true, code: true } },
      },
    });

    return res.json(history.reverse());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCrowdManually = async (req: Request, res: Response) => {
  try {
    const { zoneId, crowdCount, inflowRate, outflowRate } = req.body;
    if (!zoneId) {
      return res.status(400).json({ error: 'zoneId is required' });
    }

    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        _count: {
          select: {
            incidents: { where: { status: { not: 'RESOLVED' } } },
          },
        },
      },
    });

    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    const newCrowd = crowdCount !== undefined ? parseInt(crowdCount, 10) : zone.currentCrowd;
    const newInflow = inflowRate !== undefined ? parseInt(inflowRate, 10) : zone.inflowRate;
    const newOutflow = outflowRate !== undefined ? parseInt(outflowRate, 10) : zone.outflowRate;
    const densityPercent = Math.min(100, Math.round((newCrowd / zone.capacity) * 1000) / 10);

    // Weather info
    const weather = await prisma.weatherData.findFirst({ orderBy: { timestamp: 'desc' } });

    // Call Risk Evaluation Engine
    const riskEval = await evaluateCrowdRisk({
      zoneId: zone.id,
      zoneName: zone.name,
      currentCrowd: newCrowd,
      capacity: zone.capacity,
      densityPercent,
      inflowRate: newInflow,
      outflowRate: newOutflow,
      temperatureC: weather?.temperature || 32,
      humidityPercent: weather?.humidity || 60,
      rainMm: weather?.rainMm || 0,
      activeIncidentsCount: zone._count.incidents,
    });

    // Determine status
    let zoneStatus = 'NORMAL';
    if (riskEval.riskLevel === 'CRITICAL') zoneStatus = 'EMERGENCY';
    else if (riskEval.riskLevel === 'HIGH') zoneStatus = 'RESTRICTED';
    else if (riskEval.riskLevel === 'MODERATE') zoneStatus = 'CAUTION';

    // Update Zone
    const updatedZone = await prisma.zone.update({
      where: { id: zone.id },
      data: {
        currentCrowd: newCrowd,
        density: densityPercent,
        inflowRate: newInflow,
        outflowRate: newOutflow,
        riskLevel: riskEval.riskLevel,
        riskScore: riskEval.riskScore,
        status: zoneStatus,
      },
    });

    // Record Crowd History
    await prisma.crowdData.create({
      data: {
        zoneId: zone.id,
        crowdCount: newCrowd,
        densityPercent,
        inflowRate: newInflow,
        outflowRate: newOutflow,
        netFlow: newInflow - newOutflow,
        riskScore: riskEval.riskScore,
        riskLevel: riskEval.riskLevel,
        source: 'MANUAL_OVERRIDE',
      },
    });

    // Trigger Alert if Critical / High threshold crossed
    let createdAlert = null;
    if (riskEval.alertTriggered && riskEval.riskScore >= 75) {
      const alertCode = `ALT-${Date.now().toString().slice(-4)}`;
      createdAlert = await prisma.alert.create({
        data: {
          alertCode,
          title: `${riskEval.riskLevel} crowd density detected at ${zone.name}`,
          description: riskEval.explanations.join('; '),
          type: riskEval.riskScore >= 85 ? 'Stampede Risk' : 'Overcrowding',
          severity: riskEval.suggestedSeverity || 'HIGH',
          zoneId: zone.id,
          locationText: zone.name,
          crowdCount: newCrowd,
          densityPercent,
          riskScore: riskEval.riskScore,
          status: 'NEW',
          recommendedAction: riskEval.recommendedAction,
        },
      });

      emitSocketEvent.alertNew(createdAlert);
      emitSocketEvent.notificationNew({
        title: `🚨 Emergency Alert: ${zone.name}`,
        message: `${riskEval.riskLevel} risk! Density reached ${densityPercent}%. ${riskEval.recommendedAction}`,
        severity: riskEval.suggestedSeverity || 'HIGH',
        category: 'Critical Alert',
      });
    }

    // Broadcast Real-time Events
    emitSocketEvent.crowdUpdate({
      zoneId: updatedZone.id,
      zoneName: updatedZone.name,
      currentCrowd: updatedZone.currentCrowd,
      density: updatedZone.density,
      inflowRate: updatedZone.inflowRate,
      outflowRate: updatedZone.outflowRate,
      riskLevel: updatedZone.riskLevel,
      riskScore: updatedZone.riskScore,
      status: updatedZone.status,
    });

    emitSocketEvent.riskUpdate(riskEval);

    return res.json({
      zone: updatedZone,
      riskEvaluation: riskEval,
      alertGenerated: createdAlert,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
