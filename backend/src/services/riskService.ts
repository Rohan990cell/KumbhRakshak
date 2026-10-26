import { CrowdRiskEvaluation } from '../types';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

interface RiskInput {
  zoneId: string;
  zoneName: string;
  currentCrowd: number;
  capacity: number;
  densityPercent?: number;
  inflowRate: number;
  outflowRate: number;
  growthRatePercent?: number;
  temperatureC?: number;
  humidityPercent?: number;
  rainMm?: number;
  weatherCondition?: string;
  userReportsCount?: number;
  activeIncidentsCount?: number;
}

export const evaluateCrowdRisk = async (input: RiskInput): Promise<CrowdRiskEvaluation> => {
  // Attempt to call Python FastAPI microservice
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(`${ML_SERVICE_URL}/api/risk/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zone_id: input.zoneId,
        zone_name: input.zoneName,
        current_crowd: input.currentCrowd,
        capacity: input.capacity,
        density_percent: input.densityPercent,
        inflow_rate: input.inflowRate,
        outflow_rate: input.outflowRate,
        growth_rate_percent: input.growthRatePercent || 0.0,
        temperature_c: input.temperatureC || 32.0,
        humidity_percent: input.humidityPercent || 60.0,
        rain_mm: input.rainMm || 0.0,
        weather_condition: input.weatherCondition || 'Clear',
        user_reports_count: input.userReportsCount || 0,
        active_incidents_count: input.activeIncidentsCount || 0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data: any = await response.json();
      return {
        zoneId: data.zone_id,
        zoneName: data.zone_name,
        riskScore: data.risk_score,
        riskLevel: data.risk_level,
        confidenceScore: data.confidence_score,
        modelType: data.model_type,
        factorBreakdown: {
          crowdDensityContribution: data.factor_breakdown.crowd_density_contribution,
          crowdMomentumContribution: data.factor_breakdown.crowd_momentum_contribution,
          weatherStressContribution: data.factor_breakdown.weather_stress_contribution,
          incidentSosContribution: data.factor_breakdown.incident_sos_contribution,
          bottleneckContribution: data.factor_breakdown.bottleneck_contribution,
        },
        explanations: data.explanations,
        recommendedAction: data.recommended_action,
        evacuationUrgency: data.evacuation_urgency,
        alertTriggered: data.alert_triggered,
        suggestedSeverity: data.suggested_severity,
        timestamp: data.timestamp,
      };
    }
  } catch (err) {
    // If microservice is not responding, fallback to internal engine seamlessly
    // console.log('[RiskService] Falling back to internal engine:', err);
  }

  // Internal Fallback Risk Engine (identical logic to Python model)
  const density = input.densityPercent ?? Math.min(100, (input.currentCrowd / input.capacity) * 100);
  let densityPts = 0;
  if (density <= 50) densityPts = (density / 50) * 12;
  else if (density <= 75) densityPts = 12 + ((density - 50) / 25) * 13;
  else if (density <= 90) densityPts = 25 + ((density - 75) / 15) * 10;
  else densityPts = 35 + ((density - 90) / 10) * 5;

  const netInflow = input.inflowRate - input.outflowRate;
  let momentumPts = netInflow > 0 ? Math.min((netInflow / 150) * 15, 15) : Math.max((netInflow / 150) * 5, -5);
  if (input.growthRatePercent && input.growthRatePercent > 0) {
    momentumPts += Math.min((input.growthRatePercent / 30) * 10, 10);
  }
  momentumPts = Math.max(0, Math.min(momentumPts, 25));

  let weatherPts = 0;
  if (input.rainMm && input.rainMm > 15) weatherPts += 10;
  else if (input.rainMm && input.rainMm > 5) weatherPts += 6;
  else if (input.rainMm && input.rainMm > 0) weatherPts += 3;
  if (input.temperatureC && input.temperatureC >= 38) weatherPts += 5;
  else if (input.temperatureC && input.temperatureC >= 34) weatherPts += 3;
  weatherPts = Math.min(weatherPts, 15);

  let sosPts = 0;
  if (input.userReportsCount) sosPts += Math.min(input.userReportsCount * 2.5, 7.5);
  if (input.activeIncidentsCount) sosPts += Math.min(input.activeIncidentsCount * 4.0, 7.5);
  sosPts = Math.min(sosPts, 15);

  const isBottleneck = /ghat|bridge|entry/i.test(input.zoneName);
  const bottleneckPts = isBottleneck ? 5 : 2;

  const rawScore = densityPts + momentumPts + weatherPts + sosPts + bottleneckPts;
  const score = Math.round(Math.min(Math.max(rawScore, 5), 100) * 10) / 10;

  let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  let urgency = 'NONE';
  let action = 'Routine monitoring. Normal pedestrian movement.';
  let alertTriggered = false;
  let suggestedSeverity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL' = 'INFO';

  if (score <= 30) {
    level = 'LOW';
    urgency = 'NONE';
    action = 'Routine monitoring. Normal pedestrian movement.';
    alertTriggered = false;
    suggestedSeverity = 'INFO';
  } else if (score <= 60) {
    level = 'MODERATE';
    urgency = 'MONITOR';
    action = 'Increase vigil at access gates. Advise incoming groups of alternate paths.';
    alertTriggered = false;
    suggestedSeverity = 'WARNING';
  } else if (score <= 80) {
    level = 'HIGH';
    urgency = 'PREPARE';
    action = 'Enforce one-way crowd circulation. Deploy buffer zone holding pens and alert field QRT.';
    alertTriggered = true;
    suggestedSeverity = 'HIGH';
  } else {
    level = 'CRITICAL';
    urgency = 'IMMEDIATE';
    action = 'Restrict incoming movement immediately. Open emergency exit gates and deploy disaster response personnel.';
    alertTriggered = true;
    suggestedSeverity = 'CRITICAL';
  }

  const explanations: string[] = [];
  if (density >= 90) {
    explanations.push(`Extreme crowd density reached ${density.toFixed(1)}% of safe design capacity (${input.currentCrowd.toLocaleString()} / ${input.capacity.toLocaleString()})`);
  } else if (density >= 75) {
    explanations.push(`High crowd density reached ${density.toFixed(1)}%`);
  }

  if (netInflow > 80) {
    explanations.push(`Severe inflow-to-outflow imbalance (+${netInflow} persons/min net accumulation)`);
  } else if (netInflow > 40) {
    explanations.push(`Crowd inflow exceeds outflow (+${netInflow} persons/min)`);
  }

  if (input.growthRatePercent && input.growthRatePercent >= 15) {
    explanations.push(`Rapid crowd growth rate of +${input.growthRatePercent.toFixed(1)}% over observation window`);
  }

  if (input.userReportsCount && input.userReportsCount > 0) {
    explanations.push(`${input.userReportsCount} citizen emergency SOS report(s) actively registered in this sector`);
  }

  if (input.activeIncidentsCount && input.activeIncidentsCount > 0) {
    explanations.push(`${input.activeIncidentsCount} active on-ground emergency incident(s) under response`);
  }

  if (input.rainMm && input.rainMm > 5) {
    explanations.push(`Adverse weather: ${input.rainMm} mm rainfall creating slip and trampling hazards`);
  } else if (input.temperatureC && input.temperatureC >= 35) {
    explanations.push(`Elevated heat index (${input.temperatureC}°C) increasing dehydration/fainting risk`);
  }

  if (explanations.length === 0) {
    explanations.push('Crowd movement and parameters operating within standard safe baselines.');
  }

  return {
    zoneId: input.zoneId,
    zoneName: input.zoneName,
    riskScore: score,
    riskLevel: level,
    confidenceScore: 0.92,
    modelType: 'KumbhRakshak Rule-Based & ML-Ready Crowd Risk Engine (Prototype)',
    factorBreakdown: {
      crowdDensityContribution: Math.round(densityPts * 10) / 10,
      crowdMomentumContribution: Math.round(momentumPts * 10) / 10,
      weatherStressContribution: Math.round(weatherPts * 10) / 10,
      incidentSosContribution: Math.round(sosPts * 10) / 10,
      bottleneckContribution: Math.round(bottleneckPts * 10) / 10,
    },
    explanations,
    recommendedAction: action,
    evacuationUrgency: urgency,
    alertTriggered,
    suggestedSeverity,
    timestamp: new Date().toISOString(),
  };
};
