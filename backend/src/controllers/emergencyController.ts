import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emitSocketEvent } from '../socket';

export const getEmergencyUnits = async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    const where: any = {};
    if (type && type !== 'ALL') where.type = type as string;
    if (status && status !== 'ALL') where.status = status as string;

    const units = await prisma.emergencyUnit.findMany({
      where,
      orderBy: { distanceKm: 'asc' },
      include: {
        zone: true,
      },
    });

    return res.json(units);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateEmergencyUnit = async (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status, latitude, longitude, zoneId } = req.body;

    const updated = await prisma.emergencyUnit.update({
      where: { id },
      data: {
        status: status || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        zoneId: zoneId || undefined,
      },
      include: { zone: true },
    });

    emitSocketEvent.teamLocationUpdate({
      unitId: updated.id,
      unitCode: updated.unitCode,
      status: updated.status,
      latitude: updated.latitude,
      longitude: updated.longitude,
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getFieldTeams = async (req: Request, res: Response) => {
  try {
    const { status, zoneId } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = status as string;
    if (zoneId && zoneId !== 'ALL') where.zoneId = zoneId as string;

    const teams = await prisma.emergencyTeam.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        zone: true,
        alerts: {
          where: { status: { not: 'RESOLVED' } },
        },
        incidents: {
          where: { status: { not: 'RESOLVED' } },
        },
      },
    });

    return res.json(teams);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateFieldTeam = async (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status, latitude, longitude, zoneId } = req.body;

    const updated = await prisma.emergencyTeam.update({
      where: { id },
      data: {
        status: status || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        zoneId: zoneId || undefined,
      },
      include: { zone: true },
    });

    emitSocketEvent.teamLocationUpdate({
      teamId: updated.id,
      teamCode: updated.teamCode,
      status: updated.status,
      latitude: updated.latitude,
      longitude: updated.longitude,
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
