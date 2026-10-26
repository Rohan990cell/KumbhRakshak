import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { evaluateCrowdRisk } from '../services/riskService';
import { emitSocketEvent } from '../socket';

export const triggerSimulation = async (req: Request, res: Response) => {
  try {
    const { scenarioType } = req.body;
    // scenarioType options:
    // 'CRITICAL_CROWD_SURGE', 'FIRE_ALERT', 'MEDICAL_EMERGENCY', 'WEATHER_SQUALL', 'PILGRIM_SOS', 'RESET_NORMAL'

    if (scenarioType === 'CRITICAL_CROWD_SURGE') {
      const sangam = await prisma.zone.findFirst({ where: { code: 'ZONE-SANGAM' } });
      if (!sangam) return res.status(404).json({ error: 'Sangam zone not found' });

      // Simulate surge: 24,250 people in 25,000 capacity = 97% density
      const simulatedCount = 24250;
      const density = 97.0;

      const riskEval = await evaluateCrowdRisk({
        zoneId: sangam.id,
        zoneName: sangam.name,
        currentCrowd: simulatedCount,
        capacity: sangam.capacity,
        densityPercent: density,
        inflowRate: 490,
        outflowRate: 180,
        growthRatePercent: 24.5,
      });

      // Update zone in database
      const updatedZone = await prisma.zone.update({
        where: { id: sangam.id },
        data: {
          currentCrowd: simulatedCount,
          density,
          riskLevel: 'CRITICAL',
          riskScore: 95.0,
          status: 'EMERGENCY',
          inflowRate: 490,
          outflowRate: 180,
        },
      });

      // Find nearest QRT team & unit
      const qrtTeam = await prisma.emergencyTeam.findFirst({ where: { teamCode: 'TEAM-QRT-01' } });
      const policeUnit = await prisma.emergencyUnit.findFirst({ where: { unitCode: 'POLICE-PCR-01' } });

      // Generate Critical Alert
      const alert = await prisma.alert.create({
        data: {
          alertCode: `ALT-CRIT-${Date.now().toString().slice(-4)}`,
          title: `CRITICAL CROWD SURGE at Triveni Sangam Ghat`,
          description: `Extreme crowd density reached 97.0% (24,250 / 25,000 capacity). Net inflow spike +310 persons/min with stampede risk at western bathing steps.`,
          type: 'Stampede Risk',
          severity: 'CRITICAL',
          zoneId: sangam.id,
          locationText: 'Triveni Sangam Ghat Western Steps',
          crowdCount: simulatedCount,
          densityPercent: density,
          riskScore: 95.0,
          status: 'NEW',
          assignedTeamId: qrtTeam?.id || null,
          recommendedAction: 'Restrict incoming movement immediately and deploy additional field personnel along ramp 4.',
        },
        include: { zone: true, assignedTeam: true },
      });

      // Add to CrowdData history
      await prisma.crowdData.create({
        data: {
          zoneId: sangam.id,
          crowdCount: simulatedCount,
          densityPercent: density,
          inflowRate: 490,
          outflowRate: 180,
          netFlow: 310,
          riskScore: 95.0,
          riskLevel: 'CRITICAL',
          source: 'SIMULATION_ENGINE',
        },
      });

      // Emit real-time events
      emitSocketEvent.crowdUpdate({
        zoneId: updatedZone.id,
        currentCrowd: updatedZone.currentCrowd,
        density: updatedZone.density,
        riskLevel: 'CRITICAL',
        riskScore: 95.0,
        status: 'EMERGENCY',
      });
      emitSocketEvent.riskUpdate(riskEval);
      emitSocketEvent.alertNew(alert);
      emitSocketEvent.notificationNew({
        title: `🚨 CRITICAL ALERT: Sangam Ghat Overcrowding`,
        message: `Extreme density 97% reached! AI Risk Score: 95/100. Emergency diversions initiated.`,
        category: 'Critical Alert',
        severity: 'CRITICAL',
      });
      emitSocketEvent.simulationEvent({
        scenario: 'CRITICAL_CROWD_SURGE',
        zone: updatedZone.name,
        density,
        riskScore: 95.0,
      });

      return res.json({
        success: true,
        scenario: 'CRITICAL_CROWD_SURGE',
        zone: updatedZone,
        alert,
        assignedTeam: qrtTeam,
        assignedUnit: policeUnit,
        riskEvaluation: riskEval,
      });
    }

    if (scenarioType === 'FIRE_ALERT') {
      const sec2 = await prisma.zone.findFirst({ where: { code: 'ZONE-SEC-2' } });
      const fireTeam = await prisma.emergencyTeam.findFirst({ where: { teamCode: 'TEAM-FIRE-PATROL-01' } });
      const fireUnit = await prisma.emergencyUnit.findFirst({ where: { unitCode: 'FIRE-TENDER-01' } });

      const alert = await prisma.alert.create({
        data: {
          alertCode: `ALT-FIRE-${Date.now().toString().slice(-4)}`,
          title: `FIRE HAZARD: Gas Cylinder Leak & Smoke in Akhada Camp`,
          description: `Rapid smoke detection reported behind Sector 2 community langar tent row. High risk of fabric ignition.`,
          type: 'Fire',
          severity: 'CRITICAL',
          zoneId: sec2?.id || null,
          locationText: 'Sector 2 Akhada Camp Kitchen Area',
          status: 'NEW',
          assignedTeamId: fireTeam?.id || null,
          recommendedAction: 'Dispatch Fire Tender 01, evacuate tent lines 12-14, isolate LPG line.',
        },
        include: { zone: true, assignedTeam: true },
      });

      const incident = await prisma.incident.create({
        data: {
          incidentCode: `INC-FIRE-${Date.now().toString().slice(-4)}`,
          title: 'Akhada Kitchen Tent Fire Scare',
          description: 'LPG leak caused flash fire flame near tarpaulin partition.',
          category: 'Fire',
          severity: 'CRITICAL',
          status: 'REPORTED',
          zoneId: sec2?.id || null,
          locationText: 'Sector 2 Akhada Kitchen Row',
          latitude: 25.4362,
          longitude: 81.8813,
          assignedUnitId: fireUnit?.id || null,
          assignedTeamId: fireTeam?.id || null,
          reportedBy: 'Simulated IoT Heat Sensor Alert',
        },
        include: { assignedUnit: true, assignedTeam: true },
      });

      emitSocketEvent.alertNew(alert);
      emitSocketEvent.incidentNew(incident);
      emitSocketEvent.notificationNew({
        title: `🔥 CRITICAL FIRE ALERT: Sector 2`,
        message: `Fire incident registered in Akhada Camp. Fire Tender 01 dispatched!`,
        category: 'Critical Alert',
        severity: 'CRITICAL',
      });

      return res.json({ success: true, alert, incident });
    }

    if (scenarioType === 'MEDICAL_EMERGENCY') {
      const sangam = await prisma.zone.findFirst({ where: { code: 'ZONE-SANGAM' } });
      const ambUnit = await prisma.emergencyUnit.findFirst({ where: { unitCode: 'AMBULANCE-01' } });
      const medTeam = await prisma.emergencyTeam.findFirst({ where: { teamCode: 'TEAM-MED-FIELD-01' } });

      const incident = await prisma.incident.create({
        data: {
          incidentCode: `INC-MED-${Date.now().toString().slice(-4)}`,
          title: 'Mass Dehydration & Heat Collapse Cluster',
          description: '4 elderly pilgrims collapsed simultaneously due to dehydration near Sangam steps ramp 2.',
          category: 'Medical',
          severity: 'HIGH',
          status: 'REPORTED',
          zoneId: sangam?.id || null,
          locationText: 'Sangam Ghat Western Steps Pier 2',
          latitude: 25.4287,
          longitude: 81.8844,
          assignedUnitId: ambUnit?.id || null,
          assignedTeamId: medTeam?.id || null,
          reportedBy: 'Field First-Aid Station 1',
        },
        include: { assignedUnit: true, assignedTeam: true },
      });

      emitSocketEvent.incidentNew(incident);
      emitSocketEvent.notificationNew({
        title: `🚑 Medical Emergency Dispatched`,
        message: `Ambulance-01 en route to Sangam Pier 2 for heatstroke triage.`,
        category: 'Incident Update',
        severity: 'HIGH',
      });

      return res.json({ success: true, incident });
    }

    if (scenarioType === 'WEATHER_SQUALL') {
      const weather = await prisma.weatherData.create({
        data: {
          temperature: 24.5,
          humidity: 92.0,
          rainMm: 28.5,
          windSpeedKmh: 48.0,
          condition: 'Heavy Thunderstorm & Squall',
          weatherRisk: 'SEVERE',
          heatIndex: 26.0,
          visibilityKm: 2.1,
        },
      });

      emitSocketEvent.weatherUpdate(weather);
      emitSocketEvent.notificationNew({
        title: `⛈️ Severe Weather Squall Warning`,
        message: `Rain: 28.5 mm, Wind: 48 km/h. High river current. Pontoon bridges on high alert.`,
        category: 'Weather Warning',
        severity: 'CRITICAL',
      });

      return res.json({ success: true, weather });
    }

    if (scenarioType === 'PILGRIM_SOS') {
      const report = await prisma.userReport.create({
        data: {
          reportCode: `REP-SOS-${Date.now().toString().slice(-4)}`,
          emergencyType: 'Obstruction',
          location: 'Main Entry Gate Bandha Ramp',
          description: 'A collapsed barricade is blocking exit ramp. People are getting pushed against railings.',
          reporterName: 'Sunil Jha (Devotee)',
          reporterPhone: '+91 98112 34567',
          priority: 'CRITICAL',
          status: 'SUBMITTED',
          latitude: 25.4336,
          longitude: 81.8722,
        },
      });

      emitSocketEvent.notificationNew({
        title: `📱 Citizen SOS Alert: Exit Ramp Blocked`,
        message: `Devotee reported barricade obstruction at Main Entry Gate Bandha Ramp. Immediate police check required.`,
        category: 'Public Announcement',
        severity: 'CRITICAL',
      });

      return res.json({ success: true, report });
    }

    if (scenarioType === 'RESET_NORMAL') {
      // Reset Sangam Ghat to safe baseline
      const sangam = await prisma.zone.findFirst({ where: { code: 'ZONE-SANGAM' } });
      if (sangam) {
        await prisma.zone.update({
          where: { id: sangam.id },
          data: {
            currentCrowd: 18450,
            density: 73.8,
            riskLevel: 'HIGH',
            riskScore: 74.5,
            status: 'CAUTION',
            inflowRate: 340,
            outflowRate: 260,
          },
        });
      }

      // Reset weather
      await prisma.weatherData.create({
        data: {
          temperature: 31.5,
          humidity: 62.0,
          rainMm: 0.0,
          windSpeedKmh: 12.0,
          condition: 'Clear Sky',
          weatherRisk: 'LOW',
          heatIndex: 34.0,
          visibilityKm: 8.0,
        },
      });

      emitSocketEvent.simulationEvent({ scenario: 'RESET_NORMAL' });

      return res.json({ success: true, message: 'All demo simulation parameters reset to normal.' });
    }

    return res.status(400).json({ error: 'Unknown scenarioType' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSimulationStatus = async (_req: Request, res: Response) => {
  try {
    const sangam = await prisma.zone.findFirst({ where: { code: 'ZONE-SANGAM' } });
    const weather = await prisma.weatherData.findFirst({ orderBy: { timestamp: 'desc' } });
    const latestCriticalAlert = await prisma.alert.findFirst({
      where: { severity: 'CRITICAL' },
      orderBy: { createdAt: 'desc' },
      include: { assignedTeam: true },
    });

    return res.json({
      sangamZone: sangam,
      currentWeather: weather,
      latestCriticalAlert,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
