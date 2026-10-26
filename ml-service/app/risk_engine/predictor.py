"""
Crowd Trend Forecasting Engine
Projects future crowd density and risk level for 15, 30, 45, 60 minutes ahead
Based on net flow velocity, recent gradient, and saturation damping.
"""

from typing import List, Optional
from app.schemas.risk import PredictionPoint, TrendPredictionResponse

def forecast_crowd_trend(
    zone_id: str,
    capacity: int,
    current_crowd: int,
    inflow_rate: int,
    outflow_rate: int,
    growth_rate_percent: float = 0.0,
    forecast_window_minutes: int = 60
) -> TrendPredictionResponse:
    current_density = (current_crowd / capacity) * 100.0 if capacity > 0 else 0.0
    net_flow_per_minute = inflow_rate - outflow_rate

    predictions: List[PredictionPoint] = []
    warning_threshold_minute: Optional[int] = None

    running_crowd = current_crowd
    intervals = [15, 30, 45, 60]

    for minute in intervals:
        # Saturation damping: as crowd approaches 100%, physical movement slows down
        saturation_factor = max(0.2, 1.0 - (running_crowd / (capacity * 1.25)))
        adjusted_net_flow = net_flow_per_minute * 15 * saturation_factor
        running_crowd = int(max(0, running_crowd + adjusted_net_flow))

        density = min(100.0, round((running_crowd / capacity) * 100.0, 1))

        # Projected risk score
        if density <= 50.0:
            risk = density * 0.5
            level = "LOW"
        elif density <= 75.0:
            risk = 30.0 + ((density - 50.0) / 25.0) * 30.0
            level = "MODERATE"
        elif density <= 90.0:
            risk = 60.0 + ((density - 75.0) / 15.0) * 22.0
            level = "HIGH"
        else:
            risk = 82.0 + ((density - 90.0) / 10.0) * 18.0
            level = "CRITICAL"

        risk = round(min(100.0, risk), 1)

        if density >= 85.0 and warning_threshold_minute is None:
            warning_threshold_minute = minute

        predictions.append(
            PredictionPoint(
                time_offset_minutes=minute,
                predicted_crowd=running_crowd,
                predicted_density=density,
                predicted_risk_score=risk,
                predicted_risk_level=level
            )
        )

    return TrendPredictionResponse(
        zone_id=zone_id,
        current_density=round(current_density, 1),
        forecast_window_minutes=forecast_window_minutes,
        predictions=predictions,
        warning_threshold_exceeded_at_minute=warning_threshold_minute
    )
