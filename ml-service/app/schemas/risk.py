from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class RiskAnalysisRequest(BaseModel):
    zone_id: str
    zone_name: str
    current_crowd: int = Field(..., ge=0, description="Current estimated crowd headcount")
    capacity: int = Field(..., gt=0, description="Safe zone capacity limit")
    density_percent: Optional[float] = Field(None, ge=0.0, le=100.0)
    inflow_rate: int = Field(120, ge=0, description="People entering per minute")
    outflow_rate: int = Field(100, ge=0, description="People exiting per minute")
    growth_rate_percent: Optional[float] = Field(0.0, description="Rate of crowd count growth over last 15 mins")
    temperature_c: Optional[float] = Field(32.0, description="Ambient temperature in Celsius")
    humidity_percent: Optional[float] = Field(60.0, description="Relative humidity percentage")
    rain_mm: Optional[float] = Field(0.0, description="Rainfall in mm/hr")
    weather_condition: Optional[str] = Field("Clear", description="Weather status")
    user_reports_count: Optional[int] = Field(0, ge=0, description="Unverified or verified SOS reports in zone")
    active_incidents_count: Optional[int] = Field(0, ge=0, description="Active emergency incidents in zone")
    historical_trend: Optional[List[float]] = Field(default_factory=list, description="Past density readings")

class BatchRiskAnalysisRequest(BaseModel):
    zones: List[RiskAnalysisRequest]

class FactorBreakdown(BaseModel):
    crowd_density_contribution: float
    crowd_momentum_contribution: float
    weather_stress_contribution: float
    incident_sos_contribution: float
    bottleneck_contribution: float

class RiskAnalysisResponse(BaseModel):
    zone_id: str
    zone_name: str
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Composite risk score 0 to 100")
    risk_level: str = Field(..., description="LOW, MODERATE, HIGH, or CRITICAL")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    model_type: str = Field(
        default="KumbhRakshak Rule-Based & ML-Ready Crowd Risk Engine (Prototype)",
        description="Transparent prototype classification indicator"
    )
    factor_breakdown: FactorBreakdown
    explanations: List[str]
    recommended_action: str
    evacuation_urgency: str
    alert_triggered: bool
    suggested_severity: Optional[str] = None
    timestamp: str

class PredictionPoint(BaseModel):
    time_offset_minutes: int
    predicted_crowd: int
    predicted_density: float
    predicted_risk_score: float
    predicted_risk_level: str

class TrendPredictionResponse(BaseModel):
    zone_id: str
    current_density: float
    forecast_window_minutes: int
    predictions: List[PredictionPoint]
    warning_threshold_exceeded_at_minute: Optional[int]
