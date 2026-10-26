import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emitSocketEvent } from '../socket';

export const getZones = async (_req: Request, res: Response) => {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        _count: {
          select: {
            alerts: { where: { status: { not: 'RESOLVED' } } },
            incidents: { where: { status: { not: 'RESOLVED' } } },
            cctvs: true,
            sensors: true,
            emergencyTeams: true,
          },
        },
      },
      orderBy: { riskScore: 'desc' },
    });

    return res.json(zones);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getZoneById = async (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        cctvs: true,
        sensors: true,
        emergencyTeams: true,
        emergencyUnits: true,
        locations: true,
        alerts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        incidents: {
          take: 5,
          orderBy: { reportedAt: 'desc' },
        },
        crowdHistory: {
          take: 20,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    return res.json(zone);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateZone = async (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { capacity, currentCrowd, status, inflowRate, outflowRate, movementDirection } = req.body;

    const existing = await prisma.zone.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Zone not found' });

    const newCrowd = currentCrowd !== undefined ? currentCrowd : existing.currentCrowd;
    const newCap = capacity !== undefined ? capacity : existing.capacity;
    const density = Math.min(100, Math.round((newCrowd / newCap) * 1000) / 10);

    const updated = await prisma.zone.update({
      where: { id },
      data: {
        capacity: newCap,
        currentCrowd: newCrowd,
        density,
        status: status || existing.status,
        inflowRate: inflowRate !== undefined ? inflowRate : existing.inflowRate,
        outflowRate: outflowRate !== undefined ? outflowRate : existing.outflowRate,
        movementDirection: movementDirection || existing.movementDirection,
      },
    });

    emitSocketEvent.crowdUpdate({
      zoneId: updated.id,
      crowdCount: updated.currentCrowd,
      densityPercent: updated.density,
      inflowRate: updated.inflowRate,
      outflowRate: updated.outflowRate,
      riskLevel: updated.riskLevel,
      riskScore: updated.riskScore,
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMapData = async (_req: Request, res: Response) => {
  try {
    const [zones, cctvs, emergencyUnits, emergencyTeams, locations, activeIncidents] = await Promise.all([
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
          _count: {
            select: { alerts: { where: { status: { not: 'RESOLVED' } } } },
          },
        },
      }),
      prisma.cCTV.findMany(),
      prisma.emergencyUnit.findMany(),
      prisma.emergencyTeam.findMany(),
      prisma.location.findMany(),
      prisma.incident.findMany({
        where: { status: { not: 'RESOLVED' } },
        include: { zone: true },
      }),
    ]);

    return res.json({
      zones,
      cctvs,
      emergencyUnits,
      emergencyTeams,
      poiLocations: locations,
      activeIncidents,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
