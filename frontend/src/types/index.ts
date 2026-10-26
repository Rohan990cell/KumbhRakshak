export type RoleType = 'CONTROL_ROOM' | 'FIELD_STAFF' | 'EMERGENCY_SERVICES' | 'PILGRIM' | 'ADMIN';

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
export type IncidentStatus = 'REPORTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  roleLabel: string;
  department?: string;
  permissions: string[];
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  description?: string;
  capacity: number;
  currentCrowd: number;
  density: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  status: 'NORMAL' | 'CAUTION' | 'RESTRICTED' | 'EMERGENCY';
  latitude: number;
  longitude: number;
  inflowRate: number;
  outflowRate: number;
  movementDirection: string;
  _count?: {
    alerts?: number;
    incidents?: number;
    cctvs?: number;
    sensors?: number;
    emergencyTeams?: number;
  };
}

export interface Alert {
  id: string;
  alertCode: string;
  title: string;
  description: string;
  type: string;
  severity: AlertSeverity;
  zoneId?: string;
  zone?: Zone;
  locationText: string;
  crowdCount?: number;
  densityPercent?: number;
  riskScore?: number;
  status: AlertStatus;
  assignedTeamId?: string;
  assignedTeam?: EmergencyTeam;
  recommendedAction?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  incidentCode: string;
  title: string;
  description: string;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  zoneId?: string;
  zone?: Zone;
  locationText: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  reportedBy?: string;
  assignedUnitId?: string;
  assignedUnit?: EmergencyUnit;
  assignedTeamId?: string;
  assignedTeam?: EmergencyTeam;
  responseNotes?: string;
  reportedAt: string;
  verifiedAt?: string;
  inProgressAt?: string;
  resolvedAt?: string;
}

export interface EmergencyTeam {
  id: string;
  teamCode: string;
  name: string;
  leaderName: string;
  contactPhone: string;
  department: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'ON_SCENE' | 'OFF_DUTY';
  zoneId?: string;
  zone?: Zone;
  latitude: number;
  longitude: number;
  membersCount: number;
}

export interface EmergencyUnit {
  id: string;
  unitCode: string;
  name: string;
  type: 'AMBULANCE' | 'POLICE' | 'FIRE_BRIGADE' | 'DISASTER_RESPONSE';
  vehicleNumber: string;
  status: 'AVAILABLE' | 'BUSY' | 'DISPATCHED' | 'MAINTENANCE';
  zoneId?: string;
  zone?: Zone;
  latitude: number;
  longitude: number;
  distanceKm: number;
  contactNumber: string;
}

export interface CCTV {
  id: string;
  cameraCode: string;
  name: string;
  zoneId: string;
  zone?: Zone;
  streamUrl?: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  resolution: string;
  crowdEstimate: number;
  densityPercent: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  id?: string;
  temperature: number;
  humidity: number;
  rainMm: number;
  windSpeedKmh: number;
  condition: string;
  weatherRisk: string;
  heatIndex?: number;
  visibilityKm?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  severity: AlertSeverity;
  recipientRole: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface UserReport {
  id: string;
  reportCode: string;
  reporterName: string;
  reporterPhone?: string;
  emergencyType: string;
  location: string;
  description: string;
  imageUrl?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'VERIFIED' | 'ESCALATED' | 'RESOLVED' | 'REJECTED';
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface POILocation {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  description?: string;
  contactInfo?: string;
  icon?: string;
}

export interface RiskEvaluationResult {
  zoneId: string;
  zoneName: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  modelType: string;
  factorBreakdown: {
    crowdDensityContribution: number;
    crowdMomentumContribution: number;
    weatherStressContribution: number;
    incidentSosContribution: number;
    bottleneckContribution: number;
  };
  explanations: string[];
  recommendedAction: string;
  evacuationUrgency: string;
  alertTriggered: boolean;
  suggestedSeverity?: AlertSeverity;
  timestamp: string;
}
