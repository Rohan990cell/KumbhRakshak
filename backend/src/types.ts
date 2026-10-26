export type RoleType = 'CONTROL_ROOM' | 'FIELD_STAFF' | 'EMERGENCY_SERVICES' | 'PILGRIM' | 'ADMIN';

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
export type IncidentStatus = 'REPORTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface JwtPayload {
  userId: string;
  email: string;
  role: RoleType;
  name: string;
}

export interface CrowdRiskEvaluation {
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
