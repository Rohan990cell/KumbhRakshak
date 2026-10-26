import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emitSocketEvent } from '../socket';
import { AuthRequest } from '../middleware/auth';

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { severity, status, type, zoneId, search } = req.query;

    const where: any = {};
    if (severity && severity !== 'ALL') where.severity = severity as string;
    if (status && status !== 'ALL') where.status = status as string;
    if (type && type !== 'ALL') where.type = type as string;
    if (zoneId && zoneId !== 'ALL') where.zoneId = zoneId as string;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { locationText: { contains: search as string } },
        { alertCode: { contains: search as string } },
      ];
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        zone: { select: { id: true, name: true, code: true, density: true, riskLevel: true } },
        assignedTeam: true,
        acknowledgements: {
          include: { user: { select: { name: true, department: true } } },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    return res.json(alerts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAlertById = async (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        zone: true,
        assignedTeam: true,
        acknowledgements: {
          include: { user: true },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    return res.json(alert);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, severity, zoneId, locationText, crowdCount, densityPercent, riskScore, recommendedAction, assignedTeamId } = req.body;

    const alertCode = `ALT-MANUAL-${Date.now().toString().slice(-4)}`;
    const newAlert = await prisma.alert.create({
      data: {
        alertCode,
        title,
        description,
        type: type || 'Overcrowding',
        severity: severity || 'WARNING',
        zoneId: zoneId || null,
        locationText: locationText || 'Kumbh Sector',
        crowdCount: crowdCount ? parseInt(crowdCount, 10) : null,
        densityPercent: densityPercent ? parseFloat(densityPercent) : null,
        riskScore: riskScore ? parseFloat(riskScore) : null,
        status: 'NEW',
        assignedTeamId: assignedTeamId || null,
        recommendedAction,
      },
      include: {
        zone: true,
        assignedTeam: true,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        title: `⚠️ Alert Issued: ${newAlert.title}`,
        message: `${newAlert.type} alert at ${newAlert.locationText}. Severity: ${newAlert.severity}`,
        category: 'Critical Alert',
        severity: newAlert.severity,
        recipientRole: 'ALL',
        linkUrl: `/alerts`,
      },
    });

    emitSocketEvent.alertNew(newAlert);
    emitSocketEvent.notificationNew({
      title: `⚠️ Alert Issued: ${newAlert.title}`,
      message: `${newAlert.type} alert at ${newAlert.locationText}. Severity: ${newAlert.severity}`,
      severity: newAlert.severity,
      category: 'Critical Alert',
    });

    return res.status(201).json(newAlert);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateAlert = async (req: AuthRequest, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status, assignedTeamId, recommendedAction } = req.body;

    const existing = await prisma.alert.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Alert not found' });

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedTeamId !== undefined) updateData.assignedTeamId = assignedTeamId;
    if (recommendedAction) updateData.recommendedAction = recommendedAction;
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();

    const updated = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: { zone: true, assignedTeam: true },
    });

    emitSocketEvent.alertUpdated(updated);

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const acknowledgeAlert = async (req: AuthRequest, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { actionTaken, notes } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role || 'FIELD_STAFF';
    const userName = req.user?.name || 'On-Duty Officer';

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    // Update alert status to ACKNOWLEDGED or IN_PROGRESS
    const nextStatus = actionTaken === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS';

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        status: nextStatus,
        acknowledgedBy: userName,
        acknowledgedAt: new Date(),
        resolvedAt: nextStatus === 'RESOLVED' ? new Date() : null,
      },
      include: { zone: true, assignedTeam: true },
    });

    // Record acknowledgement in DB
    const ack = await prisma.acknowledgement.create({
      data: {
        alertId: id,
        userId: userId || null,
        role: userRole,
        actionTaken: actionTaken || 'ACKNOWLEDGED',
        notes: notes || `Alert acknowledged and response initiated by ${userName}`,
      },
      include: { user: true },
    });

    emitSocketEvent.alertUpdated(updatedAlert);
    emitSocketEvent.notificationNew({
      title: `✅ Alert Acknowledged: ${alert.alertCode}`,
      message: `${alert.title} has been acknowledged by ${userName}. Status: ${nextStatus}`,
      category: 'Incident Update',
      severity: 'INFO',
    });

    return res.json({
      alert: updatedAlert,
      acknowledgement: ack,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
