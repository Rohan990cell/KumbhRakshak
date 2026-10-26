import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { evaluateCrowdRisk } from '../services/riskService';
import { emitSocketEvent } from '../socket';

export const getCCTVList = async (_req: Request, res: Response) => {
  try {
    const cctvs = await prisma.cCTV.findMany({
      include: {
        zone: true,
      },
      orderBy: { cameraCode: 'asc' },
    });

    return res.json(cctvs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const simulateCameraSurge = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { crowdDelta = 1500 } = req.body;

    const camera = await prisma.cCTV.findUnique({
      where: { id },
      include: { zone: true },
    });

    if (!camera || !camera.zone) return res.status(404).json({ error: 'Camera or zone not found' });

    const newCrowd = Math.max(500, camera.crowdEstimate + parseInt(crowdDelta, 10));
    const newDensity = Math.min(99.0, Math.round((newCrowd / (camera.zone.capacity * 0.4)) * 1000) / 10);
    const riskLevel = newDensity > 85 ? 'CRITICAL' : newDensity > 65 ? 'HIGH' : newDensity > 45 ? 'MODERATE' : 'LOW';

    const updatedCamera = await prisma.cCTV.update({
      where: { id },
      data: {
        crowdEstimate: newCrowd,
        densityPercent: newDensity,
        riskLevel,
      },
      include: { zone: true },
    });

    // Also update parent zone crowd
    const updatedZoneCrowd = Math.min(camera.zone.capacity * 1.05, camera.zone.currentCrowd + parseInt(crowdDelta, 10));
    const zoneDensity = Math.min(100, Math.round((updatedZoneCrowd / camera.zone.capacity) * 1000) / 10);

    const riskEval = await evaluateCrowdRisk({
      zoneId: camera.zone.id,
      zoneName: camera.zone.name,
      currentCrowd: updatedZoneCrowd,
      capacity: camera.zone.capacity,
      densityPercent: zoneDensity,
      inflowRate: camera.zone.inflowRate + 60,
      outflowRate: camera.zone.outflowRate,
    });

    await prisma.zone.update({
      where: { id: camera.zone.id },
      data: {
        currentCrowd: updatedZoneCrowd,
        density: zoneDensity,
        riskLevel: riskEval.riskLevel,
        riskScore: riskEval.riskScore,
        status: riskEval.riskLevel === 'CRITICAL' ? 'EMERGENCY' : 'CAUTION',
      },
    });

    // If critical alert triggered, create alert
    let createdAlert = null;
    if (riskEval.alertTriggered && riskEval.riskScore >= 75) {
      createdAlert = await prisma.alert.create({
        data: {
          alertCode: `ALT-CCTV-${Date.now().toString().slice(-4)}`,
          title: `CCTV Alert: Overcrowding detected by ${camera.cameraCode}`,
          description: `Computer vision feed from ${camera.name} detected crowd density surging to ${newDensity}%. ${riskEval.explanations.join('; ')}`,
          type: 'Overcrowding',
          severity: riskEval.suggestedSeverity || 'HIGH',
          zoneId: camera.zone.id,
          locationText: camera.name,
          crowdCount: updatedZoneCrowd,
          densityPercent: zoneDensity,
          riskScore: riskEval.riskScore,
          status: 'NEW',
          recommendedAction: riskEval.recommendedAction,
        },
      });

      emitSocketEvent.alertNew(createdAlert);
      emitSocketEvent.notificationNew({
        title: `🚨 CCTV Spike: ${camera.cameraCode}`,
        message: `${camera.name} observed sudden crowd surge. Density: ${newDensity}%`,
        category: 'Critical Alert',
        severity: 'HIGH',
      });
    }

    emitSocketEvent.crowdUpdate({
      zoneId: camera.zone.id,
      currentCrowd: updatedZoneCrowd,
      density: zoneDensity,
      riskLevel: riskEval.riskLevel,
      riskScore: riskEval.riskScore,
    });

    return res.json({
      camera: updatedCamera,
      zoneRisk: riskEval,
      alertGenerated: createdAlert,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
