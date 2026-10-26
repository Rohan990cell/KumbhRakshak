import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emitSocketEvent } from '../socket';

export const getReports = async (req: Request, res: Response) => {
  try {
    const { status, priority, type } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = status as string;
    if (priority && priority !== 'ALL') where.priority = priority as string;
    if (type && type !== 'ALL') where.emergencyType = type as string;

    const reports = await prisma.userReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(reports);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const { emergencyType, location, description, reporterName, reporterPhone, imageUrl, latitude, longitude } = req.body;

    if (!emergencyType || !location || !description) {
      return res.status(400).json({ error: 'emergencyType, location and description are required' });
    }

    const reportCode = `REP-${Date.now().toString().slice(-4)}`;
    const newReport = await prisma.userReport.create({
      data: {
        reportCode,
        emergencyType,
        location,
        description,
        reporterName: reporterName || 'Anonymous Devotee',
        reporterPhone: reporterPhone || null,
        imageUrl: imageUrl || null,
        priority: /fire|stampede|crush|medical|unconscious/i.test(description + emergencyType) ? 'CRITICAL' : 'HIGH',
        status: 'SUBMITTED',
        latitude: latitude ? parseFloat(latitude) : 25.4285,
        longitude: longitude ? parseFloat(longitude) : 81.8845,
      },
    });

    emitSocketEvent.notificationNew({
      title: `📱 Citizen SOS: ${newReport.emergencyType}`,
      message: `${newReport.emergencyType} reported near ${newReport.location}: ${newReport.description.slice(0, 80)}...`,
      category: 'Public Announcement',
      severity: newReport.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency report submitted successfully.',
      reportId: newReport.reportCode,
      data: newReport,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status, escalateToIncident } = req.body;

    const report = await prisma.userReport.findUnique({ where: { id } });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    let incidentCreated = null;

    if (escalateToIncident && status === 'ESCALATED') {
      const incCode = `INC-${Date.now().toString().slice(-4)}`;
      incidentCreated = await prisma.incident.create({
        data: {
          incidentCode: incCode,
          title: `Escalated SOS: ${report.emergencyType} at ${report.location}`,
          description: `Citizen Report (${report.reportCode}): ${report.description}. Reporter: ${report.reporterName} (${report.reporterPhone || 'N/A'})`,
          category: report.emergencyType === 'Fire' ? 'Fire' : report.emergencyType === 'Medical' ? 'Medical' : 'Crowd Surge',
          severity: report.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          status: 'REPORTED',
          locationText: report.location,
          latitude: report.latitude || 25.4285,
          longitude: report.longitude || 81.8845,
          reportedBy: `Pilgrim SOS (${report.reporterName})`,
        },
      });

      emitSocketEvent.incidentNew(incidentCreated);
    }

    const updated = await prisma.userReport.update({
      where: { id },
      data: {
        status,
        verifiedIncidentId: incidentCreated ? incidentCreated.id : undefined,
      },
    });

    return res.json({
      report: updated,
      incident: incidentCreated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
