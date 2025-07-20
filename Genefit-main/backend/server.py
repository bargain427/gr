from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import json
import base64
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime

# Import models
from models.user import User, UserCreate, UserUpdate
from models.dna import DNAReport, DNAReportCreate, DNAReportResponse, AnalysisStatus, DNAProvider
from models.health import HealthPlan, HealthPlanCreate, HealthPlanResponse, AIInsight, HealthRiskAssessment, WearableData, PlanType, RiskLevel

# Import services
from services.ai_service import AIHealthService
from services.dna_service import DNAAnalysisService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
ai_service = AIHealthService()
dna_service = DNAAnalysisService()

# Create the main app
app = FastAPI(title="GeneFit AI API", description="AI-powered personalized health platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@api_router.get("/")
async def health_check():
    return {"message": "GeneFit AI API is running", "status": "healthy"}

# User Management Endpoints
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        user = User(**user_data.dict())
        result = await db.users.insert_one(user.dict())
        
        if result.inserted_id:
            logger.info(f"Created user: {user.email}")
            return user
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
            
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserUpdate):
    """Update user information"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {k: v for k, v in user_data.dict(exclude_unset=True).items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user_id})
    return User(**updated_user)

# DNA Analysis Endpoints
@api_router.post("/dna/upload", response_model=DNAReportResponse)
async def upload_dna_report(
    background_tasks: BackgroundTasks,
    user_id: str = Form(...),
    provider: DNAProvider = Form(...),
    file: UploadFile = File(...)
):
    """Upload DNA report file for analysis"""
    try:
        # Validate user exists
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Read and encode file content
        file_content = await file.read()
        encoded_content = base64.b64encode(file_content).decode('utf-8')
        
        # Create DNA report record
        dna_report = DNAReport(
            user_id=user_id,
            filename=file.filename,
            provider=provider,
            file_size=len(file_content),
            analysis_status=AnalysisStatus.UPLOADED
        )
        
        # Save to database
        await db.dna_reports.insert_one(dna_report.dict())
        
        # Start background analysis
        background_tasks.add_task(
            process_dna_analysis, 
            dna_report.id, 
            encoded_content, 
            file.filename, 
            provider,
            user_id
        )
        
        logger.info(f"DNA report uploaded for user {user_id}: {file.filename}")
        
        return DNAReportResponse(
            id=dna_report.id,
            filename=dna_report.filename,
            provider=dna_report.provider,
            file_size=dna_report.file_size,
            analysis_status=dna_report.analysis_status,
            markers_analyzed=0,
            total_markers=0,
            uploaded_at=dna_report.uploaded_at,
            analyzed_at=None,
            error_message=None
        )
        
    except Exception as e:
        logger.error(f"Error uploading DNA report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/dna/reports/{user_id}", response_model=List[DNAReportResponse])
async def get_user_dna_reports(user_id: str):
    """Get all DNA reports for a user"""
    reports = await db.dna_reports.find({"user_id": user_id}).to_list(100)
    
    return [
        DNAReportResponse(
            id=report["id"],
            filename=report["filename"],
            provider=report["provider"],
            file_size=report["file_size"],
            analysis_status=report["analysis_status"],
            markers_analyzed=report.get("markers_analyzed", 0),
            total_markers=report.get("total_markers", 0),
            uploaded_at=report["uploaded_at"],
            analyzed_at=report.get("analyzed_at"),
            error_message=report.get("error_message")
        )
        for report in reports
    ]

@api_router.get("/dna/status/{report_id}")
async def get_analysis_status(report_id: str):
    """Get analysis status for a DNA report"""
    report = await db.dna_reports.find_one({"id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="DNA report not found")
    
    return {
        "status": report["analysis_status"],
        "markers_analyzed": report.get("markers_analyzed", 0),
        "total_markers": report.get("total_markers", 0),
        "progress": (report.get("markers_analyzed", 0) / max(report.get("total_markers", 1), 1)) * 100
    }

# Health Plan Endpoints
@api_router.post("/health-plans", response_model=HealthPlanResponse)
async def create_health_plan(plan_data: HealthPlanCreate):
    """Generate a new health plan"""
    try:
        # Validate user exists
        user = await db.users.find_one({"id": plan_data.user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's genetic insights
        genetic_insights = await get_user_genetic_insights(plan_data.user_id)
        
        # Generate AI plan content
        plan_content = await ai_service.generate_health_plan(
            User(**user), 
            plan_data.plan_type, 
            genetic_insights
        )
        
        # Create health plan record
        health_plan = HealthPlan(
            user_id=plan_data.user_id,
            plan_type=plan_data.plan_type,
            title=plan_content["title"],
            description=plan_content["description"],
            ai_generated_content=plan_content
        )
        
        await db.health_plans.insert_one(health_plan.dict())
        
        logger.info(f"Created {plan_data.plan_type} plan for user {plan_data.user_id}")
        
        return HealthPlanResponse(
            id=health_plan.id,
            plan_type=health_plan.plan_type,
            title=health_plan.title,
            description=health_plan.description,
            progress=health_plan.progress,
            is_active=health_plan.is_active,
            created_at=health_plan.created_at
        )
        
    except Exception as e:
        logger.error(f"Error creating health plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/health-plans/{user_id}", response_model=List[HealthPlanResponse])
async def get_user_health_plans(user_id: str):
    """Get all health plans for a user"""
    plans = await db.health_plans.find({"user_id": user_id, "is_active": True}).to_list(100)
    
    return [
        HealthPlanResponse(
            id=plan["id"],
            plan_type=plan["plan_type"],
            title=plan["title"],
            description=plan["description"],
            progress=plan.get("progress", 0),
            is_active=plan.get("is_active", True),
            created_at=plan["created_at"]
        )
        for plan in plans
    ]

@api_router.get("/health-plans/detail/{plan_id}")
async def get_health_plan_detail(plan_id: str):
    """Get detailed health plan content"""
    plan = await db.health_plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Health plan not found")
    
    return {
        "id": plan["id"],
        "title": plan["title"],
        "description": plan["description"],
        "content": plan["ai_generated_content"],
        "progress": plan.get("progress", 0),
        "created_at": plan["created_at"]
    }

# AI Insights Endpoints
@api_router.get("/insights/{user_id}")
async def get_user_insights(user_id: str, limit: int = 10):
    """Get AI insights for a user"""
    insights = await db.ai_insights.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return insights

@api_router.post("/insights/daily/{user_id}")
async def generate_daily_insight(user_id: str):
    """Generate daily insight for a user"""
    try:
        # Get user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get recent wearable data (mock for now)
        recent_data = {
            "steps": 8547,
            "sleep_hours": 7.3,
            "heart_rate_avg": 72,
            "active_minutes": 42
        }
        
        # Generate insight
        insight_content = await ai_service.generate_daily_insight(User(**user), recent_data)
        
        # Create insight record
        insight = AIInsight(
            user_id=user_id,
            insight_type="daily_tip",
            title=insight_content["title"],
            content=insight_content["message"],
            confidence_score=85.0,
            genetic_basis=["circadian rhythm genes", "metabolism genes"],
            priority="medium"
        )
        
        await db.ai_insights.insert_one(insight.dict())
        
        return insight_content
        
    except Exception as e:
        logger.error(f"Error generating daily insight: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Dashboard Endpoints
@api_router.get("/dashboard/{user_id}")
async def get_user_dashboard(user_id: str):
    """Get comprehensive dashboard data for a user"""
    try:
        # Get user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get health plans
        health_plans = await db.health_plans.find(
            {"user_id": user_id, "is_active": True}
        ).to_list(10)
        
        # Get recent insights
        insights = await db.ai_insights.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(5).to_list(5)
        
        # Get DNA analysis status
        dna_reports = await db.dna_reports.find({"user_id": user_id}).to_list(10)
        
        # Get risk assessments
        risk_assessments = await db.health_risk_assessments.find(
            {"user_id": user_id}
        ).to_list(10)
        
        # Mock wearable data (in real implementation, this would come from connected devices)
        wearable_data = {
            "steps": 8547,
            "heart_rate": 72,
            "sleep": 7.3,
            "calories": 1847,
            "active_minutes": 42,
            "sync_status": "Connected"
        }
        
        return {
            "user": {k: str(v) if k == '_id' else v for k, v in user.items() if k != '_id'},
            "health_plans": [{k: str(v) if k == '_id' else v for k, v in plan.items() if k != '_id'} for plan in health_plans],
            "insights": [{k: str(v) if k == '_id' else v for k, v in insight.items() if k != '_id'} for insight in insights],
            "dna_reports": [{k: str(v) if k == '_id' else v for k, v in report.items() if k != '_id'} for report in dna_reports],
            "risk_assessments": [{k: str(v) if k == '_id' else v for k, v in risk.items() if k != '_id'} for risk in risk_assessments],
            "wearable_data": wearable_data,
            "wellness_score": calculate_wellness_score(health_plans, insights)
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Wearables Endpoints
@api_router.post("/wearables/sync/{user_id}")
async def sync_wearable_data(user_id: str, device_data: Dict[str, Any]):
    """Sync wearable device data"""
    try:
        # In real implementation, this would connect to actual wearable APIs
        # For now, we'll store mock data
        
        wearable_entries = []
        for data_type, value in device_data.items():
            if data_type in ['steps', 'heart_rate', 'sleep_hours', 'calories', 'active_minutes']:
                entry = WearableData(
                    user_id=user_id,
                    device_name=device_data.get('device_name', 'Unknown Device'),
                    data_type=data_type,
                    value=float(value),
                    unit=get_unit_for_data_type(data_type),
                    recorded_at=datetime.utcnow()
                )
                wearable_entries.append(entry.dict())
        
        if wearable_entries:
            await db.wearable_data.insert_many(wearable_entries)
        
        logger.info(f"Synced {len(wearable_entries)} wearable data points for user {user_id}")
        
        return {"message": f"Synced {len(wearable_entries)} data points successfully"}
        
    except Exception as e:
        logger.error(f"Error syncing wearable data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/wearables/{user_id}")
async def get_wearable_data(user_id: str, days: int = 7):
    """Get recent wearable data for a user"""
    try:
        from datetime import timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        wearable_data = await db.wearable_data.find({
            "user_id": user_id,
            "recorded_at": {"$gte": start_date}
        }).sort("recorded_at", -1).to_list(1000)
        
        return wearable_data
        
    except Exception as e:
        logger.error(f"Error getting wearable data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper Functions
async def process_dna_analysis(report_id: str, file_content: str, filename: str, provider: DNAProvider, user_id: str):
    """Background task to process DNA analysis"""
    try:
        # Update status to processing
        await db.dna_reports.update_one(
            {"id": report_id},
            {"$set": {"analysis_status": AnalysisStatus.PROCESSING, "total_markers": 900}}
        )
        
        # Process DNA file
        genetic_markers = await dna_service.process_dna_file(file_content, filename, provider)
        
        # Simulate analysis progress
        async def update_progress(report_id, analyzed, total):
            await db.dna_reports.update_one(
                {"id": report_id},
                {"$set": {"markers_analyzed": analyzed, "total_markers": total}}
            )
        
        await dna_service.simulate_analysis_progress(report_id, update_progress)
        
        # Get user for AI analysis
        user_doc = await db.users.find_one({"id": user_id})
        user = User(**user_doc)
        
        # Create mock DNA report for AI analysis
        dna_report = DNAReport(
            id=report_id,
            user_id=user_id,
            filename=filename,
            provider=provider,
            file_size=0,
            genetic_markers=genetic_markers
        )
        
        # Generate AI analysis
        genetic_insights = await ai_service.analyze_genetic_data(dna_report, user)
        
        # Store risk assessments
        for risk_data in genetic_insights.get("risk_assessments", []):
            risk_assessment = HealthRiskAssessment(
                user_id=user_id,
                condition=risk_data["condition"],
                risk_level=RiskLevel(risk_data["risk_level"]),
                confidence_score=risk_data["confidence_score"],
                genetic_factors=risk_data.get("genetic_factors", []),
                recommendations=risk_data.get("recommendations", [])
            )
            await db.health_risk_assessments.insert_one(risk_assessment.dict())
        
        # Update DNA report status
        await db.dna_reports.update_one(
            {"id": report_id},
            {
                "$set": {
                    "analysis_status": AnalysisStatus.ANALYZED,
                    "genetic_markers": [m.dict() for m in genetic_markers],
                    "markers_analyzed": 847,
                    "total_markers": 900,
                    "analyzed_at": datetime.utcnow()
                }
            }
        )
        
        # Store genetic insights
        await db.genetic_insights.insert_one({
            "user_id": user_id,
            "dna_report_id": report_id,
            "insights": genetic_insights,
            "created_at": datetime.utcnow()
        })
        
        logger.info(f"DNA analysis completed for report {report_id}")
        
    except Exception as e:
        logger.error(f"DNA analysis failed for report {report_id}: {e}")
        await db.dna_reports.update_one(
            {"id": report_id},
            {
                "$set": {
                    "analysis_status": AnalysisStatus.FAILED,
                    "error_message": str(e)
                }
            }
        )

async def get_user_genetic_insights(user_id: str) -> Dict[str, Any]:
    """Get genetic insights for a user"""
    insights = await db.genetic_insights.find_one({"user_id": user_id})
    if insights:
        return insights["insights"]
    
    # Return fallback insights if no analysis available
    return {
        "risk_assessments": [],
        "nutrition_insights": {"recommendations": ["Eat whole foods", "Stay hydrated"]},
        "fitness_insights": {"optimal_exercise_types": ["Mixed cardio/strength"]},
        "mental_wellness": {"sleep_optimization": ["7-9 hours sleep", "Cool room"]}
    }

def calculate_wellness_score(health_plans: List[Dict], insights: List[Dict]) -> int:
    """Calculate overall wellness score"""
    if not health_plans:
        return 65
    
    total_progress = sum(plan.get("progress", 0) for plan in health_plans)
    avg_progress = total_progress / len(health_plans)
    
    # Boost score based on insights engagement
    insight_boost = min(len(insights) * 5, 20)
    
    return min(int(avg_progress + insight_boost), 100)

def get_unit_for_data_type(data_type: str) -> str:
    """Get appropriate unit for data type"""
    units = {
        "steps": "count",
        "heart_rate": "bpm",
        "sleep_hours": "hours",
        "calories": "kcal",
        "active_minutes": "minutes"
    }
    return units.get(data_type, "unit")

# Include the router in the main app
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)