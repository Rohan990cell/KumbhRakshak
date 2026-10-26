from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List

from app.schemas.risk import (
    RiskAnalysisRequest,
    BatchRiskAnalysisRequest,
    RiskAnalysisResponse,
    TrendPredictionResponse
)
from app.risk_engine.scorer import calculate_composite_risk
from app.risk_engine.predictor import forecast_crowd_trend

app = FastAPI(
    title="KumbhRakshak AI Risk Analysis Microservice",
    description="Explainable Crowd Risk Engine & Predictive Simulation for Kumbh Mela Emergency Management (College PBL Prototype)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "kumbhrakshak-ml-risk-engine",
        "timestamp": datetime.utcnow().isoformat(),
        "model_architecture": "Hybrid Rule-Weight Gradient & Explainable Crowd Dynamics (PBL Prototype)"
    }

@app.get("/api/risk/model-info")
def get_model_info():
    return {
        "model_name": "KumbhRakshak Explainable Crowd Risk Engine",
        "framework": "Rule-Based + Feature Gradient (ML-Ready College Prototype)",
        "features": [
            "Crowd Density % (Current Count vs Zone Capacity)",
            "Net Flow Momentum (Inflow vs Outflow velocity)",
            "Crowd Growth Rate % (15-min rolling window)",
            "Environmental Stressors (Ambient Temp °C, Rain mm/hr)",
            "Emergency SOS & Incident Density",
            "Spatial Vulnerability Index (Ghats, Pontoon Bridges, Narrow Corridors)"
        ],
        "risk_levels": {
            "0-30": "LOW (Normal Pedestrian Flow)",
            "31-60": "MODERATE (High Vigilance Required)",
            "61-80": "HIGH (Crowd Diversion & QRT Standby)",
            "81-100": "CRITICAL (Immediate Emergency Response & Containment)"
        },
        "literature_citations": [
            {
                "title": "Managing Crowds with Technology: Cases of Hajj and Kumbh Mela",
                "author": "Mohammad Yamin",
                "year": 2019,
                "relevance": "Framework for multi-sensor data collection and mobile communication."
            },
            {
                "title": "Integration of Image Processing and Crowd Simulation for Understanding Crowd Dynamics in Kumbh Mela",
                "author": "Karthika P. S., Ashish Verma, Subhadeep Pal",
                "year": 2020,
                "relevance": "CCTV crowd extraction and social force simulation."
            },
            {
                "title": "Spatial Strategies for Crowd Management in Haridwar, India",
                "author": "Sindhuja Kasthala, Binoy B.V., Harshit S. Lakra",
                "year": 2019,
                "relevance": "GIS spatial routing, pontoon bridge choke points, and emergency zones."
            }
        ]
    }

@app.post("/api/risk/evaluate", response_model=RiskAnalysisResponse)
def evaluate_single_zone(payload: RiskAnalysisRequest):
    try:
        score, level, breakdown, explanations, action, urgency, alert_triggered, sev = calculate_composite_risk(payload)
        
        # Calculate transparent confidence score (0.85 to 0.96 based on data completeness)
        confidence = 0.85
        if payload.growth_rate_percent is not None:
            confidence += 0.04
        if payload.user_reports_count is not None:
            confidence += 0.03
        if payload.rain_mm is not None:
            confidence += 0.03

        return RiskAnalysisResponse(
            zone_id=payload.zone_id,
            zone_name=payload.zone_name,
            risk_score=score,
            risk_level=level,
            confidence_score=min(round(confidence, 2), 0.96),
            factor_breakdown=breakdown,
            explanations=explanations,
            recommended_action=action,
            evacuation_urgency=urgency,
            alert_triggered=alert_triggered,
            suggested_severity=sev,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk evaluation error: {str(e)}")

@app.post("/api/risk/evaluate-batch", response_model=List[RiskAnalysisResponse])
def evaluate_batch_zones(payload: BatchRiskAnalysisRequest):
    results: List[RiskAnalysisResponse] = []
    for zone in payload.zones:
        score, level, breakdown, explanations, action, urgency, alert_triggered, sev = calculate_composite_risk(zone)
        results.append(
            RiskAnalysisResponse(
                zone_id=zone.zone_id,
                zone_name=zone.zone_name,
                risk_score=score,
                risk_level=level,
                confidence_score=0.91,
                factor_breakdown=breakdown,
                explanations=explanations,
                recommended_action=action,
                evacuation_urgency=urgency,
                alert_triggered=alert_triggered,
                suggested_severity=sev,
                timestamp=datetime.utcnow().isoformat()
            )
        )
    return results

@app.get("/api/risk/forecast/{zone_id}", response_model=TrendPredictionResponse)
def get_zone_forecast(
    zone_id: str,
    capacity: int = 25000,
    current_crowd: int = 18450,
    inflow: int = 340,
    outflow: int = 260
):
    return forecast_crowd_trend(
        zone_id=zone_id,
        capacity=capacity,
        current_crowd=current_crowd,
        inflow_rate=inflow,
        outflow_rate=outflow
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
