from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"

class PlanType(str, Enum):
    NUTRITION = "nutrition"
    FITNESS = "fitness"
    MENTAL_WELLNESS = "mental_wellness"
    DISEASE_PREVENTION = "disease_prevention"

class HealthRiskAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    condition: str
    risk_level: RiskLevel
    confidence_score: float  # 0-100
    genetic_factors: List[str] = []
    lifestyle_factors: List[str] = []
    recommendations: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HealthPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_type: PlanType
    title: str
    description: str
    ai_generated_content: Dict[str, Any]  # Detailed plan from AI
    progress: float = 0.0  # 0-100
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AIInsight(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    insight_type: str  # daily_tip, recommendation, alert, etc.
    title: str
    content: str
    confidence_score: float
    genetic_basis: List[str] = []
    actionable: bool = True
    priority: str = "medium"  # low, medium, high
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class WearableData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    device_name: str
    data_type: str  # steps, heart_rate, sleep, calories, etc.
    value: float
    unit: str
    recorded_at: datetime
    synced_at: datetime = Field(default_factory=datetime.utcnow)

class HealthPlanCreate(BaseModel):
    user_id: str
    plan_type: PlanType

class HealthPlanResponse(BaseModel):
    id: str
    plan_type: PlanType
    title: str
    description: str
    progress: float
    is_active: bool
    created_at: datetime