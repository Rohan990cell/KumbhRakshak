import type {
  Zone,
  Alert,
  Incident,
  EmergencyTeam,
  EmergencyUnit,
  CCTV,
  WeatherData,
  NotificationItem,
  UserReport,
  POILocation,
  RiskEvaluationResult,
  User,
  RoleType,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_ZONES,
  INITIAL_EMERGENCY_TEAMS,
  INITIAL_EMERGENCY_UNITS,
  INITIAL_ALERTS,
  INITIAL_INCIDENTS,
  INITIAL_CCTVS,
  INITIAL_WEATHER,
  INITIAL_USER_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POIS,
  RESEARCH_CITATIONS,
} from './mockData';
import { emitSocketEvent } from './socket';

const STORAGE_KEY = 'kumbhrakshak_demo_store_v2';

interface DemoState {
  zones: Zone[];
  alerts: Alert[];
  incidents: Incident[];
  emergencyUnits: EmergencyUnit[];
  emergencyTeams: EmergencyTeam[];
  cctvs: CCTV[];
  weather: WeatherData;
  userReports: UserReport[];
  notifications: NotificationItem[];
  poiLocations: POILocation[];
  currentUser: User;
}

const getInitialState = (): DemoState => {
  return {
    zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
    alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
    incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
    emergencyUnits: JSON.parse(JSON.stringify(INITIAL_EMERGENCY_UNITS)),
    emergencyTeams: JSON.parse(JSON.stringify(INITIAL_EMERGENCY_TEAMS)),
    cctvs: JSON.parse(JSON.stringify(INITIAL_CCTVS)),
    weather: JSON.parse(JSON.stringify(INITIAL_WEATHER)),
    userReports: JSON.parse(JSON.stringify(INITIAL_USER_REPORTS)),
    notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
    poiLocations: JSON.parse(JSON.stringify(INITIAL_POIS)),
    currentUser: DEMO_USERS.CONTROL_ROOM,
  };
};

class MockStore {
  private state: DemoState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DemoState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse demo state from localStorage, using fresh baseline', e);
    }
    const fresh = getInitialState();
    this.saveState(fresh);
    return fresh;
  }

  private saveState(state: DemoState = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save demo state to localStorage', e);
    }
  }

  public resetDemoData() {
    this.state = getInitialState();
    this.saveState(this.state);

    // Notify components of fresh state
    emitSocketEvent('alert:updated', this.state.alerts[0]);
    emitSocketEvent('crowd:update', {
      zoneId: 'ZONE-SANGAM',
      crowdCount: 18450,
      densityPercent: 73.8,
      riskLevel: 'HIGH',
      riskScore: 74.5,
      status: 'CAUTION',
    });
    emitSocketEvent('weather:update', this.state.weather);
    return { success: true, message: 'Demo data reset to clean baseline' };
  }

  // Auth
  public getCurrentUser(): User {
    return this.state.currentUser || DEMO_USERS.CONTROL_ROOM;
  }

  public setCurrentUser(user: User) {
    this.state.currentUser = user;
    this.saveState();
  }

  public loginUser(email: string): { user: User; token: string } {
    let matchedUser = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!matchedUser) {
      // If email specifies role keyword
      const emailLower = email.toLowerCase();
      if (emailLower.includes('field') || emailLower.includes('magistrate')) matchedUser = DEMO_USERS.FIELD_STAFF;
      else if (emailLower.includes('emergency') || emailLower.includes('108') || emailLower.includes('ambulance')) matchedUser = DEMO_USERS.EMERGENCY_SERVICES;
      else if (emailLower.includes('pilgrim') || emailLower.includes('public') || emailLower.includes('citizen')) matchedUser = DEMO_USERS.PILGRIM;
      else if (emailLower.includes('admin')) matchedUser = DEMO_USERS.ADMIN;
      else matchedUser = DEMO_USERS.CONTROL_ROOM;
    }
    this.setCurrentUser(matchedUser);
    return { user: matchedUser, token: `demo-jwt-token-${matchedUser.role}` };
  }

  public switchRole(role: RoleType): User {
    const user = DEMO_USERS[role] || DEMO_USERS.CONTROL_ROOM;
    this.setCurrentUser(user);
    return user;
  }

  // Dashboard Stats
  public getDashboardStats() {
    const activeZones = this.state.zones;
    const totalPeople = activeZones.reduce((sum, z) => sum + z.currentCrowd, 0);
    const highRiskCount = activeZones.filter((z) => z.riskLevel === 'HIGH' || z.riskLevel === 'CRITICAL').length;
    const activeAlertsCount = this.state.alerts.filter((a) => a.status !== 'RESOLVED').length;
    const emergencyIncidentsCount = this.state.incidents.filter((i) => i.status !== 'RESOLVED').length;
    const activeTeamsCount = this.state.emergencyTeams.filter((t) => t.status !== 'OFF_DUTY').length;

    // Time-series hourly demo data
    const timeSeries = [
      { time: '04:00', Sangam: 11200, Akshayavat: 6800, Total: 58000 },
      { time: '06:00', Sangam: 14500, Akshayavat: 8900, Total: 74000 },
      { time: '08:00', Sangam: 17200, Akshayavat: 11400, Total: 89000 },
      { time: '10:00', Sangam: 18450, Akshayavat: 13500, Total: 102500 },
      { time: '12:00', Sangam: 16900, Akshayavat: 12100, Total: 96000 },
      { time: '14:00', Sangam: 15300, Akshayavat: 10800, Total: 88000 },
      { time: '16:00', Sangam: 17800, Akshayavat: 12600, Total: 98500 },
      { time: '18:00 (Proj)', Sangam: 21000, Akshayavat: 14200, Total: 115000 },
    ];

    // Incident categories count
    const catMap: Record<string, number> = {};
    this.state.incidents.forEach((inc) => {
      catMap[inc.category] = (catMap[inc.category] || 0) + 1;
    });
    const incidentsByCategory = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    // Zone populations
    const zonePopulation = this.state.zones.map((z) => ({
      zone: z.name.replace(' (', '\n(').replace(' & ', ' & '),
      count: z.currentCrowd,
      capacity: z.capacity,
    }));

    return {
      kpis: {
        totalActiveZones: activeZones.length,
        totalPeopleEstimated: totalPeople,
        highRiskZones: highRiskCount,
        activeAlerts: activeAlertsCount,
        emergencyIncidents: emergencyIncidentsCount,
        fieldTeamsActive: activeTeamsCount,
      },
      zones: this.getZones(),
      recentIncidents: this.getIncidents().slice(0, 6),
      analytics: {
        timeSeries,
        incidentsByCategory,
        zonePopulation,
      },
      weather: this.state.weather,
    };
  }

  // Zones
  public getZones(): Zone[] {
    return this.state.zones.map((z) => {
      const zoneAlerts = this.state.alerts.filter((a) => a.zoneId === z.id && a.status !== 'RESOLVED').length;
      const zoneIncidents = this.state.incidents.filter((i) => i.zoneId === z.id && i.status !== 'RESOLVED').length;
      const zoneTeams = this.state.emergencyTeams.filter((t) => t.zoneId === z.id).length;
      return {
        ...z,
        _count: {
          alerts: zoneAlerts,
          incidents: zoneIncidents,
          emergencyTeams: zoneTeams,
          cctvs: 2,
          sensors: 2,
        },
      };
    });
  }

  public updateCrowd(payload: { zoneId: string; crowdCount: number; inflowRate?: number; outflowRate?: number }): Zone {
    const zone = this.state.zones.find((z) => z.id === payload.zoneId || z.code === payload.zoneId);
    if (!zone) {
      throw new Error(`Zone ${payload.zoneId} not found`);
    }

    zone.currentCrowd = Math.max(0, payload.crowdCount);
    zone.density = +( (zone.currentCrowd / zone.capacity) * 100 ).toFixed(1);

    if (payload.inflowRate !== undefined) zone.inflowRate = payload.inflowRate;
    if (payload.outflowRate !== undefined) zone.outflowRate = payload.outflowRate;

    // Recalculate risk
    const netFlow = (zone.inflowRate || 200) - (zone.outflowRate || 200);
    const flowPressure = netFlow > 50 ? 8 : 0;
    zone.riskScore = Math.min(100, Math.max(10, Math.round(zone.density * 0.95 + flowPressure)));

    if (zone.density >= 88 || zone.riskScore >= 85) {
      zone.riskLevel = 'CRITICAL';
      zone.status = 'RESTRICTED';
    } else if (zone.density >= 70 || zone.riskScore >= 65) {
      zone.riskLevel = 'HIGH';
      zone.status = 'CAUTION';
    } else if (zone.density >= 50 || zone.riskScore >= 45) {
      zone.riskLevel = 'MODERATE';
      zone.status = 'NORMAL';
    } else {
      zone.riskLevel = 'LOW';
      zone.status = 'NORMAL';
    }

    this.saveState();

    emitSocketEvent('crowd:update', {
      zoneId: zone.id,
      crowdCount: zone.currentCrowd,
      densityPercent: zone.density,
      riskLevel: zone.riskLevel,
      riskScore: zone.riskScore,
      status: zone.status,
    });

    return zone;
  }

  // Map Data
  public getMapData() {
    return {
      zones: this.getZones(),
      cctvs: this.getCCTVs(),
      emergencyUnits: this.getEmergencyUnits(),
      poiLocations: this.state.poiLocations,
      activeIncidents: this.getIncidents().filter((i) => i.status !== 'RESOLVED'),
    };
  }

  // Alerts
  public getAlerts(statusFilter?: string): Alert[] {
    const list = this.state.alerts.map((a) => {
      const zone = this.state.zones.find((z) => z.id === a.zoneId);
      const team = this.state.emergencyTeams.find((t) => t.id === a.assignedTeamId);
      return {
        ...a,
        zone,
        assignedTeam: team,
      };
    });

    if (statusFilter && statusFilter !== 'ALL') {
      return list.filter((a) => a.status === statusFilter);
    }
    return list;
  }

  public acknowledgeAlert(alertId: string, actionTaken: string, notes?: string): Alert {
    const alert = this.state.alerts.find((a) => a.id === alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = (actionTaken as any) || 'IN_PROGRESS';
    alert.acknowledgedBy = this.state.currentUser?.name || 'Inspector Vikram Singh';
    alert.acknowledgedAt = 'Just now';
    if (actionTaken === 'RESOLVED') {
      alert.resolvedAt = new Date().toISOString();
    }
    if (notes) {
      alert.recommendedAction = `${alert.recommendedAction ? alert.recommendedAction + ' • ' : ''}${notes}`;
    }

    this.saveState();
    emitSocketEvent('alert:updated', alert);
    return alert;
  }

  public createAlert(payload: Partial<Alert>): Alert {
    const code = `ALT-2026-${(this.state.alerts.length + 1).toString().padStart(3, '0')}`;
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      alertCode: code,
      title: payload.title || 'Manual Alert Triggered',
      description: payload.description || 'Command officer initiated emergency alert.',
      type: payload.type || 'Overcrowding',
      severity: payload.severity || 'HIGH',
      locationText: payload.locationText || 'Triveni Sangam Ghat',
      status: 'NEW',
      recommendedAction: payload.recommendedAction || 'Deploy patrol squad immediately.',
      createdAt: new Date().toISOString(),
      zoneId: payload.zoneId || this.state.zones[0].id,
      crowdCount: 18450,
      densityPercent: 74,
      riskScore: 75,
    };

    this.state.alerts.unshift(newAlert);
    this.saveState();
    emitSocketEvent('alert:new', newAlert);
    return newAlert;
  }

  // Incidents
  public getIncidents(): Incident[] {
    return this.state.incidents.map((i) => {
      const zone = this.state.zones.find((z) => z.id === i.zoneId);
      const unit = this.state.emergencyUnits.find((u) => u.id === i.assignedUnitId);
      const team = this.state.emergencyTeams.find((t) => t.id === i.assignedTeamId);
      return {
        ...i,
        zone,
        assignedUnit: unit,
        assignedTeam: team,
      };
    });
  }

  public updateIncident(incidentId: string, payload: Partial<Incident>): Incident {
    const incident = this.state.incidents.find((i) => i.id === incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    if (payload.status) {
      incident.status = payload.status;
      if (payload.status === 'VERIFIED' && !incident.verifiedAt) incident.verifiedAt = new Date().toISOString();
      if (payload.status === 'IN_PROGRESS' && !incident.inProgressAt) incident.inProgressAt = new Date().toISOString();
      if (payload.status === 'RESOLVED') incident.resolvedAt = new Date().toISOString();
    }
    if (payload.responseNotes) {
      incident.responseNotes = payload.responseNotes;
    }
    if (payload.assignedUnitId) {
      incident.assignedUnitId = payload.assignedUnitId;
    }
    if (payload.assignedTeamId) {
      incident.assignedTeamId = payload.assignedTeamId;
    }

    this.saveState();
    return incident;
  }

  public createIncident(payload: Partial<Incident>): Incident {
    const code = `INC-2026-${(this.state.incidents.length + 1).toString().padStart(3, '0')}`;
    const newInc: Incident = {
      id: `inc-${Date.now()}`,
      incidentCode: code,
      title: payload.title || 'New Field Incident',
      description: payload.description || 'Incident reported by field staff.',
      category: payload.category || 'Medical',
      severity: payload.severity || 'HIGH',
      status: 'REPORTED',
      locationText: payload.locationText || 'Sangam Ghat Western Steps',
      latitude: payload.latitude || 25.4285,
      longitude: payload.longitude || 81.8845,
      reportedBy: this.state.currentUser?.name || 'Duty Officer',
      reportedAt: new Date().toISOString(),
      zoneId: payload.zoneId || this.state.zones[0].id,
    };

    this.state.incidents.unshift(newInc);
    this.saveState();
    return newInc;
  }

  // Emergency Units
  public getEmergencyUnits(): EmergencyUnit[] {
    return this.state.emergencyUnits.map((u) => {
      const zone = this.state.zones.find((z) => z.id === u.zoneId);
      return { ...u, zone };
    });
  }

  public updateEmergencyUnit(unitId: string, payload: { status: string }): EmergencyUnit {
    const unit = this.state.emergencyUnits.find((u) => u.id === unitId);
    if (!unit) {
      throw new Error(`Unit ${unitId} not found`);
    }
    unit.status = payload.status as any;
    this.saveState();
    return unit;
  }

  // Emergency Teams
  public getEmergencyTeams(): EmergencyTeam[] {
    return this.state.emergencyTeams.map((t) => {
      const zone = this.state.zones.find((z) => z.id === t.zoneId);
      return { ...t, zone };
    });
  }

  public updateEmergencyTeam(teamId: string, payload: { status: string }): EmergencyTeam {
    const team = this.state.emergencyTeams.find((t) => t.id === teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }
    team.status = payload.status as any;
    this.saveState();
    return team;
  }

  // CCTV
  public getCCTVs(): CCTV[] {
    return this.state.cctvs.map((c) => {
      const zone = this.state.zones.find((z) => z.id === c.zoneId);
      return { ...c, zone };
    });
  }

  public simulateCCTVSurge(camId: string, crowdDelta: number): CCTV {
    const cam = this.state.cctvs.find((c) => c.id === camId);
    if (!cam) {
      throw new Error(`Camera ${camId} not found`);
    }
    cam.crowdEstimate = Math.max(100, cam.crowdEstimate + crowdDelta);
    cam.densityPercent = Math.min(100, Math.round((cam.crowdEstimate / 6500) * 100));
    cam.riskLevel = cam.densityPercent > 85 ? 'CRITICAL' : cam.densityPercent > 70 ? 'HIGH' : cam.densityPercent > 50 ? 'MODERATE' : 'LOW';

    this.saveState();
    return cam;
  }

  // Weather
  public getWeather() {
    return {
      current: this.state.weather,
      history: [this.state.weather],
    };
  }

  public simulateWeather(payload: Partial<WeatherData>): WeatherData {
    this.state.weather = {
      ...this.state.weather,
      ...payload,
    };
    this.saveState();
    emitSocketEvent('weather:update', this.state.weather);
    return this.state.weather;
  }

  // Explainable AI Risk Analysis
  public getRiskZones(): { evaluations: RiskEvaluationResult[]; summary: any } {
    const evaluations: RiskEvaluationResult[] = this.state.zones.map((zone) => {
      const bottleneckFactor = zone.code === 'ZONE-SEC-1' || zone.code === 'ZONE-SEC-3' ? 24 : 8;
      const inflowMomentum = Math.min(30, Math.round((zone.inflowRate / 10) * 0.3));
      const densityContrib = Math.round(zone.density * 0.4);
      const weatherContrib = this.state.weather.windSpeedKmh > 30 ? 12 : 5;
      const sosContrib = this.state.incidents.filter((i) => i.zoneId === zone.id && i.status !== 'RESOLVED').length * 6;

      const calculatedScore = Math.min(100, Math.max(10, Math.round(densityContrib + inflowMomentum + bottleneckFactor + weatherContrib + sosContrib)));

      const level =
        calculatedScore >= 85 ? 'CRITICAL' : calculatedScore >= 68 ? 'HIGH' : calculatedScore >= 45 ? 'MODERATE' : 'LOW';

      const explanations = [
        `Crowd packing density: ${zone.density}% (${zone.currentCrowd.toLocaleString()} / ${zone.capacity.toLocaleString()})`,
        `Directional momentum: ${zone.inflowRate} inflow/min vs ${zone.outflowRate} outflow/min (${zone.movementDirection})`,
        bottleneckFactor > 15 ? 'Narrow historical choke-point identified by GIS geometry' : 'Dispersal avenues sufficiently wide',
        `Current atmospheric index: ${this.state.weather.temperature}°C, ${this.state.weather.condition}`,
      ];

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        riskScore: calculatedScore,
        riskLevel: level,
        confidenceScore: 93.4,
        modelType: 'Hybrid YOLOv8 + Helbing Social Force Dynamics',
        factorBreakdown: {
          crowdDensityContribution: densityContrib,
          crowdMomentumContribution: inflowMomentum,
          weatherStressContribution: weatherContrib,
          incidentSosContribution: sosContrib,
          bottleneckContribution: bottleneckFactor,
        },
        explanations,
        recommendedAction:
          level === 'CRITICAL'
            ? 'Deploy immediate QRT cordoning, enforce one-way radial dispersal, halt inbound gate admissions.'
            : level === 'HIGH'
            ? 'Regulate batch releases at entry pontoon, announce diversion via PA speakers.'
            : level === 'MODERATE'
            ? 'Continuous surveillance monitor, keep volunteer squads on standby.'
            : 'Normal crowd equilibrium; standard observation protocols.',
        evacuationUrgency: level === 'CRITICAL' ? 'IMMEDIATE' : level === 'HIGH' ? 'ELEVATED' : 'STANDARD',
        alertTriggered: level === 'CRITICAL' || level === 'HIGH',
        suggestedSeverity: level === 'CRITICAL' ? 'CRITICAL' : level === 'HIGH' ? 'HIGH' : 'WARNING',
        timestamp: new Date().toISOString(),
      };
    });

    return {
      evaluations,
      summary: {
        totalMonitored: evaluations.length,
        highRiskCount: evaluations.filter((e) => e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL').length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  public getResearchCitations() {
    return RESEARCH_CITATIONS;
  }

  // Reports
  public getReports(): UserReport[] {
    return this.state.userReports;
  }

  public createReport(payload: Partial<UserReport>): { success: boolean; reportId: string; data: UserReport } {
    const code = `REP-2026-${(this.state.userReports.length + 101).toString()}`;
    const newReport: UserReport = {
      id: `rep-${Date.now()}`,
      reportCode: code,
      reporterName: payload.reporterName || 'Devotee / Citizen',
      reporterPhone: payload.reporterPhone || '+91 98000 00000',
      emergencyType: payload.emergencyType || 'General Medical SOS',
      location: payload.location || 'Sangam Ghat Western Steps',
      description: payload.description || 'Emergency reported via public portal.',
      priority: payload.priority || 'HIGH',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    this.state.userReports.unshift(newReport);
    this.saveState();

    emitSocketEvent('notification:new', {
      id: `notif-${Date.now()}`,
      title: `🚨 Citizen SOS: ${newReport.emergencyType}`,
      message: `${newReport.location}: ${newReport.description}`,
      category: 'Citizen Report',
      severity: 'HIGH',
      recipientRole: 'CONTROL_ROOM',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, reportId: newReport.reportCode, data: newReport };
  }

  public updateReport(reportId: string, payload: { status: string; escalateToIncident?: boolean }): UserReport {
    const report = this.state.userReports.find((r) => r.id === reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    report.status = payload.status as any;

    if (payload.escalateToIncident) {
      this.createIncident({
        title: `Escalated SOS: ${report.emergencyType} at ${report.location}`,
        description: report.description,
        category: report.emergencyType.includes('Medical') ? 'Medical' : report.emergencyType.includes('Child') ? 'Lost Person' : 'Crowd Surge',
        severity: 'HIGH',
        locationText: report.location,
        reportedBy: `Citizen Report (${report.reporterName})`,
      });
    }

    this.saveState();
    return report;
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return this.state.notifications;
  }

  public markAllNotificationsRead() {
    this.state.notifications.forEach((n) => {
      n.isRead = true;
    });
    this.saveState();
    return { success: true };
  }

  public broadcastNotification(payload: Partial<NotificationItem>): NotificationItem {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: payload.title || 'Broadcast Message',
      message: payload.message || 'Announcement to personnel.',
      category: payload.category || 'Public Announcement',
      severity: payload.severity || 'INFO',
      recipientRole: payload.recipientRole || 'ALL',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.state.notifications.unshift(newNotif);
    this.saveState();
    emitSocketEvent('notification:new', newNotif);
    return newNotif;
  }

  // Simulation Triggers
  public triggerSimulation(scenarioType: string) {
    if (scenarioType === 'RESET_NORMAL') {
      return this.resetDemoData();
    }

    if (scenarioType === 'CRITICAL_CROWD_SURGE') {
      const sangam = this.updateCrowd({
        zoneId: 'ZONE-SANGAM',
        crowdCount: 24200,
        inflowRate: 520,
        outflowRate: 180,
      });

      const alert = this.createAlert({
        title: 'CRITICAL STAMPEDE RISK: Sangam Ghat Ramp 4 Surge',
        description: 'Computer vision density reached 96.8%. Severe bidirectional congestion observed at entry pontoon.',
        type: 'Stampede Risk',
        severity: 'CRITICAL',
        locationText: 'Triveni Sangam Ghat Western Steps Ramp 4',
        recommendedAction: 'Restrict incoming movement, open emergency gate 3B, dispatch QRT Alpha.',
        zoneId: sangam.id,
      });

      return { success: true, message: 'Simulated Critical Crowd Surge at Sangam Ghat', alert };
    }

    if (scenarioType === 'FIRE_ALERT') {
      const sec2 = this.state.zones.find((z) => z.code === 'ZONE-SEC-2');
      const alert = this.createAlert({
        title: 'HIGH FIRE ALARM: Akhada Camp Kitchen Sector 2',
        description: 'Smoke and short-circuit sparks reported near gas distribution line.',
        type: 'Fire',
        severity: 'HIGH',
        locationText: 'Sector 2 Akhada Camp Row 4',
        recommendedAction: 'Isolate power line; Foam Tender 01 dispatched.',
        zoneId: sec2?.id,
      });
      return { success: true, message: 'Simulated Akhada Tent Fire Incident', alert };
    }

    if (scenarioType === 'MEDICAL_EMERGENCY') {
      const foodZone = this.state.zones.find((z) => z.code === 'ZONE-FOOD-LGR');
      const alert = this.createAlert({
        title: 'MASS HEATSTROKE CLUSTER: Annakshetra Distribution Zone',
        description: 'Multiple pilgrims collapsed due to heat and humidity. Medical triage requested.',
        type: 'Medical Emergency',
        severity: 'HIGH',
        locationText: 'Annakshetra & Food Distribution Zone',
        recommendedAction: 'Ambulance 01 moving through hospital green corridor with electrolyte packs.',
        zoneId: foodZone?.id,
      });
      return { success: true, message: 'Simulated Medical Heatstroke Cluster', alert };
    }

    if (scenarioType === 'WEATHER_SQUALL') {
      this.simulateWeather({
        temperature: 27.5,
        humidity: 89,
        rainMm: 28.0,
        windSpeedKmh: 46.0,
        condition: 'Severe Squall & Thunderstorm',
        weatherRisk: 'HIGH',
      });
      return { success: true, message: 'Simulated Severe Squall & Weather Alert' };
    }

    if (scenarioType === 'PILGRIM_SOS') {
      const res = this.createReport({
        emergencyType: 'Medical Assistance (Fainting)',
        location: 'Sangam Pier 2 Steps',
        description: 'Elderly family member collapsed near river edge. Stretcher needed urgently.',
        reporterName: 'Sunil Pathak (Devotee)',
        reporterPhone: '+91 98200 44556',
        priority: 'CRITICAL',
      });
      return { success: true, message: 'Simulated Citizen SOS Alert Dispatched', report: res.data };
    }

    return { success: true, message: `Executed scenario: ${scenarioType}` };
  }
}

export const mockStore = new MockStore();
