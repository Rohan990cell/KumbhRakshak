import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emitSocketEvent } from '../socket';
import { AuthRequest } from '../middleware/auth';

export const getIncidents = async (req: Request, res: Response) => {
  try {
    const { category, status, severity, zoneId } = req.query;

    const where: any = {};
    if (category && category !== 'ALL') where.category = category as string;
    if (status && status !== 'ALL') where.status = status as string;
    if (severity && severity !== 'ALL') where.severity = severity as string;
    if (zoneId && zoneId !== 'ALL') where.zoneId = zoneId as string;

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      include: {
        zone: true,
        assignedUnit: true,
        assignedTeam: true,
        acknowledgements: {
          include: { user: true },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    return res.json(incidents);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        zone: true,
        assignedUnit: true,
        assignedTeam: true,
        acknowledgements: {
          include: { user: true },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    return res.json(incident);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createIncident = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, severity, zoneId, locationText, latitude, longitude, imageUrl } = req.body;

    // Find nearest emergency unit if available
    let recommendedUnit = null;
    if (category === 'Medical') {
      recommendedUnit = await prisma.emergencyUnit.findFirst({
        where: { type: 'AMBULANCE', status: 'AVAILABLE' },
        orderBy: { distanceKm: 'asc' },
      });
    } else if (category === 'Fire') {
      recommendedUnit = await prisma.emergencyUnit.findFirst({
        where: { type: 'FIRE_BRIGADE', status: 'AVAILABLE' },
        orderBy: { distanceKm: 'asc' },
      });
    } else {
      recommendedUnit = await prisma.emergencyUnit.findFirst({
        where: { type: 'POLICE', status: 'AVAILABLE' },
        orderBy: { distanceKm: 'asc' },
      });
    }

    const code = `INC-${Date.now().toString().slice(-4)}`;
    const newIncident = await prisma.incident.create({
      data: {
        incidentCode: code,
        title,
        description,
        category: category || 'Medical',
        severity: severity || 'HIGH',
        status: 'REPORTED',
        zoneId: zoneId || null,
        locationText: locationText || 'Kumbh Area',
        latitude: latitude ? parseFloat(latitude) : 25.4285,
        longitude: longitude ? parseFloat(longitude) : 81.8845,
        imageUrl: imageUrl || null,
        reportedBy: req.user?.name || 'Citizen Report / Command Dispatch',
        assignedUnitId: recommendedUnit ? recommendedUnit.id : null,
      },
      include: {
        zone: true,
        assignedUnit: true,
      },
    });

    // Notify control room & emergency services
    emitSocketEvent.incidentNew(newIncident);
    emitSocketEvent.notificationNew({
      title: `🚨 New Emergency Incident: ${newIncident.title}`,
      message: `${newIncident.category} incident reported at ${newIncident.locationText}. Priority: ${newIncident.severity}`,
      category: 'Incident Update',
      severity: newIncident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
    });

    return res.status(201).json(newIncident);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateIncident = async (req: AuthRequest, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status, assignedUnitId, assignedTeamId, responseNotes } = req.body;

    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Incident not found' });

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'VERIFIED') updateData.verifiedAt = new Date();
      if (status === 'IN_PROGRESS') updateData.inProgressAt = new Date();
      if (status === 'RESOLVED') updateData.resolvedAt = new Date();
    }
    if (assignedUnitId !== undefined) updateData.assignedUnitId = assignedUnitId;
    if (assignedTeamId !== undefined) updateData.assignedTeamId = assignedTeamId;
    if (responseNotes) updateData.responseNotes = responseNotes;

    const updated = await prisma.incident.update({
      where: { id },
      data: updateData,
      include: {
        zone: true,
        assignedUnit: true,
        assignedTeam: true,
      },
    });

    // If unit was assigned, update unit status to DISPATCHED
    if (assignedUnitId) {
      await prisma.emergencyUnit.update({
        where: { id: assignedUnitId },
        data: { status: status === 'RESOLVED' ? 'AVAILABLE' : 'DISPATCHED' },
      });
    }

    emitSocketEvent.incidentUpdated(updated);

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
