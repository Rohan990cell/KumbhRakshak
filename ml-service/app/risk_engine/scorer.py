"""
Crowd Risk Scorer Engine
Combines:
1. Crowd Density (Capacity vs Current Count) - Weight 40%
2. Flow Dynamics & Momentum (Inflow vs Outflow Rate) - Weight 25%
3. Environmental / Weather Stress (Heat index, Rain mm) - Weight 15%
4. Incident & Citizen SOS Reports - Weight 15%
5. Spatial Bottleneck Factor - Weight 5%
"""

from typing import Dict, List, Tuple
from app.schemas.risk import RiskAnalysisRequest, FactorBreakdown

def calculate_composite_risk(data: RiskAnalysisRequest) -> Tuple[float, str, FactorBreakdown, List[str], str, str, bool, str]:
    # 1. Density Calculation
    calculated_density = (data.current_crowd / data.capacity) * 100.0 if data.capacity > 0 else 0.0
    density_val = data.density_percent if data.density_percent is not None else calculated_density
    density_val = min(max(density_val, 0.0), 100.0)

    # Density Contribution (0 - 40 pts)
    # Non-linear curve: above 75% risk escalates exponentially
    if density_val <= 50.0:
        density_pts = (density_val / 50.0) * 12.0
    elif density_val <= 75.0:
        density_pts = 12.0 + ((density_val - 50.0) / 25.0) * 13.0 # up to 25 pts
    elif density_val <= 90.0:
        density_pts = 25.0 + ((density_val - 75.0) / 15.0) * 10.0 # up to 35 pts
    else:
        density_pts = 35.0 + ((density_val - 90.0) / 10.0) * 5.0  # up to 40 pts

    # 2. Flow Momentum & Growth Rate (0 - 25 pts)
    net_inflow = data.inflow_rate - data.outflow_rate
    momentum_pts = 0.0
    if net_inflow > 0:
        # positive accumulation
        momentum_pts += min((net_inflow / 150.0) * 15.0, 15.0)
    else:
        # crowd is easing out
        momentum_pts += max((net_inflow / 150.0) * 5.0, -5.0)

    if data.growth_rate_percent and data.growth_rate_percent > 0:
        momentum_pts += min((data.growth_rate_percent / 30.0) * 10.0, 10.0)
    momentum_pts = max(0.0, min(momentum_pts, 25.0))

    # 3. Weather Stress (0 - 15 pts)
    weather_pts = 0.0
    # Rain factor
    if data.rain_mm and data.rain_mm > 0:
        if data.rain_mm > 15.0: # heavy rain
            weather_pts += 10.0
        elif data.rain_mm > 5.0: # moderate rain
            weather_pts += 6.0
        else: # light drizzle
            weather_pts += 3.0

    # Temperature / Heat Index factor
    if data.temperature_c and data.temperature_c >= 38.0:
        weather_pts += 5.0
    elif data.temperature_c and data.temperature_c >= 34.0:
        weather_pts += 3.0

    weather_pts = min(weather_pts, 15.0)

    # 4. Incident & SOS Reports (0 - 15 pts)
    sos_pts = 0.0
    if data.user_reports_count and data.user_reports_count > 0:
        sos_pts += min(data.user_reports_count * 2.5, 7.5)
    if data.active_incidents_count and data.active_incidents_count > 0:
        sos_pts += min(data.active_incidents_count * 4.0, 7.5)
    sos_pts = min(sos_pts, 15.0)

    # 5. Bottleneck Factor (0 - 5 pts)
    bottleneck_pts = 0.0
    if "ghat" in data.zone_name.lower() or "bridge" in data.zone_name.lower() or "entry" in data.zone_name.lower():
        bottleneck_pts = 5.0
    else:
        bottleneck_pts = 2.0

    # Composite Raw Score (0 - 100)
    raw_score = density_pts + momentum_pts + weather_pts + sos_pts + bottleneck_pts
    final_score = round(min(max(raw_score, 5.0), 100.0), 1)

    # Classification Thresholds:
    # 0–30 = LOW
    # 31–60 = MODERATE
    # 61–80 = HIGH
    # 81–100 = CRITICAL
    if final_score <= 30.0:
        level = "LOW"
        urgency = "NONE"
        action = "Routine monitoring. Normal pedestrian movement."
        alert_triggered = False
        suggested_sev = "INFO"
    elif final_score <= 60.0:
        level = "MODERATE"
        urgency = "MONITOR"
        action = "Increase vigil at access gates. Advise incoming groups of alternate paths."
        alert_triggered = False
        suggested_sev = "WARNING"
    elif final_score <= 80.0:
        level = "HIGH"
        urgency = "PREPARE"
        action = "Enforce one-way crowd circulation. Deploy buffer zone holding pens and alert field QRT."
        alert_triggered = True
        suggested_sev = "HIGH"
    else:
        level = "CRITICAL"
        urgency = "IMMEDIATE"
        action = "Restrict incoming movement immediately. Open emergency exit gates and deploy disaster response personnel."
        alert_triggered = True
        suggested_sev = "CRITICAL"

    # Transparent Explainability Engine
    explanations: List[str] = []
    if density_val >= 90.0:
        explanations.append(f"Extreme crowd density reached {density_val:.1f}% of safe design capacity ({data.current_crowd:,} / {data.capacity:,})")
    elif density_val >= 75.0:
        explanations.append(f"High crowd density reached {density_val:.1f}%")

    if net_inflow > 80:
        explanations.append(f"Severe inflow-to-outflow imbalance (+{net_inflow} persons/min net accumulation)")
    elif net_inflow > 40:
        explanations.append(f"Crowd inflow exceeds outflow (+{net_inflow} persons/min)")

    if data.growth_rate_percent and data.growth_rate_percent >= 15.0:
        explanations.append(f"Rapid crowd growth rate of +{data.growth_rate_percent:.1f}% over last observation window")

    if data.user_reports_count and data.user_reports_count > 0:
        explanations.append(f"{data.user_reports_count} citizen emergency SOS report(s) actively registered in this sector")

    if data.active_incidents_count and data.active_incidents_count > 0:
        explanations.append(f"{data.active_incidents_count} active on-ground emergency incident(s) under response")

    if data.rain_mm and data.rain_mm > 5.0:
        explanations.append(f"Adverse weather: {data.rain_mm} mm rainfall creating slip and trampling hazards")
    elif data.temperature_c and data.temperature_c >= 35.0:
        explanations.append(f"Elevated heat index ({data.temperature_c}°C) increasing dehydration/fainting risk")

    if not explanations:
        explanations.append("Crowd movement and parameters operating within standard safe baselines.")

    factor_breakdown = FactorBreakdown(
        crowd_density_contribution=round(density_pts, 1),
        crowd_momentum_contribution=round(momentum_pts, 1),
        weather_stress_contribution=round(weather_pts, 1),
        incident_sos_contribution=round(sos_pts, 1),
        bottleneck_contribution=round(bottleneck_pts, 1)
    )

    return final_score, level, factor_breakdown, explanations, action, urgency, alert_triggered, suggested_sev
