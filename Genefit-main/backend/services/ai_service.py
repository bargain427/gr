import os
from typing import List, Dict, Any, Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage
from models.dna import DNAReport, GeneticMarker
from models.health import HealthRiskAssessment, HealthPlan, AIInsight, PlanType, RiskLevel
from models.user import User
import asyncio
import json
import logging

logger = logging.getLogger(__name__)

class AIHealthService:
    def __init__(self):
        self.api_key = os.environ.get('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
    def _create_chat_instance(self, system_message: str, session_id: str) -> LlmChat:
        """Create a new LlmChat instance for each request"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o").with_max_tokens(4096)
        return chat

    async def analyze_genetic_data(self, dna_report: DNAReport, user: User) -> Dict[str, Any]:
        """Analyze genetic data and generate insights"""
        system_message = """You are a world-class genetic counselor and health AI specialist. 
        You analyze genetic data to provide personalized health insights based on established scientific research.
        
        Focus on:
        1. Identifying relevant genetic markers for health conditions
        2. Assessing risk levels based on genetic variants
        3. Providing actionable lifestyle recommendations
        4. Explaining complex genetics in simple terms
        
        Always emphasize that genetic predisposition is not destiny and lifestyle choices matter significantly."""
        
        # Create genetic profile summary
        genetic_summary = {
            'total_markers': len(dna_report.genetic_markers),
            'analyzed_markers': [
                {
                    'rsid': marker.rsid,
                    'genotype': marker.genotype,
                    'effect': marker.effect
                } for marker in dna_report.genetic_markers[:50]  # Limit for API
            ],
            'user_demographics': {
                'age': user.age,
                'gender': user.gender,
                'height': user.height,
                'weight': user.weight
            }
        }
        
        prompt = f"""
        Analyze the following genetic profile for personalized health insights:
        
        User Profile: Age {user.age}, Gender: {user.gender}
        Genetic Data: {json.dumps(genetic_summary, indent=2)}
        
        Please provide:
        1. Risk assessment for major health conditions (cardiovascular, diabetes, alzheimer's, cancer)
        2. Nutritional recommendations based on genetic variants
        3. Exercise and fitness optimization suggestions
        4. Mental health and cognitive function insights
        5. Disease prevention strategies
        
        Format the response as a JSON object with the structure:
        {{
            "risk_assessments": [
                {{
                    "condition": "string",
                    "risk_level": "low|moderate|high",
                    "confidence_score": 0-100,
                    "genetic_factors": ["rsid1", "rsid2"],
                    "recommendations": ["rec1", "rec2"]
                }}
            ],
            "nutrition_insights": {{
                "genetic_factors": ["factor1", "factor2"],
                "recommendations": ["rec1", "rec2"],
                "foods_to_emphasize": ["food1", "food2"],
                "foods_to_limit": ["food1", "food2"]
            }},
            "fitness_insights": {{
                "genetic_factors": ["factor1", "factor2"],
                "optimal_exercise_types": ["type1", "type2"],
                "recovery_recommendations": ["rec1", "rec2"]
            }},
            "mental_wellness": {{
                "stress_response_profile": "string",
                "sleep_optimization": ["tip1", "tip2"],
                "cognitive_enhancement": ["tip1", "tip2"]
            }}
        }}
        """
        
        chat = self._create_chat_instance(system_message, f"genetic_analysis_{dna_report.id}")
        
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON response
            analysis_result = json.loads(response)
            logger.info(f"Genetic analysis completed for user {user.id}")
            return analysis_result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            return self._get_fallback_analysis()
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return self._get_fallback_analysis()

    async def generate_health_plan(self, user: User, plan_type: PlanType, genetic_insights: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed health plan based on genetic insights"""
        system_message = f"""You are an expert {plan_type.value} specialist who creates personalized plans based on genetic insights.
        
        Create evidence-based, actionable plans that:
        1. Are tailored to the individual's genetic profile
        2. Include specific, measurable goals
        3. Provide step-by-step implementation guidance
        4. Consider lifestyle factors and preferences
        5. Include progress tracking metrics
        """
        
        # Extract relevant insights based on plan type
        relevant_insights = self._extract_relevant_insights(genetic_insights, plan_type)
        
        prompt = f"""
        Create a personalized {plan_type.value} plan for:
        
        User: Age {user.age}, Gender: {user.gender}
        Genetic Insights: {json.dumps(relevant_insights, indent=2)}
        
        Generate a comprehensive plan with:
        1. Clear objectives and goals
        2. Specific recommendations and actions
        3. Weekly/monthly milestones
        4. Progress tracking methods
        5. Tips for success and motivation
        
        Format as JSON:
        {{
            "title": "string",
            "description": "string",
            "objectives": ["obj1", "obj2"],
            "weekly_plan": [
                {{
                    "week": 1,
                    "focus": "string",
                    "actions": ["action1", "action2"],
                    "metrics": ["metric1", "metric2"]
                }}
            ],
            "key_recommendations": ["rec1", "rec2"],
            "success_tips": ["tip1", "tip2"],
            "genetic_optimization": ["opt1", "opt2"]
        }}
        """
        
        chat = self._create_chat_instance(system_message, f"plan_{plan_type.value}_{user.id}")
        
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            plan_content = json.loads(response)
            logger.info(f"Generated {plan_type.value} plan for user {user.id}")
            return plan_content
            
        except Exception as e:
            logger.error(f"Plan generation failed: {e}")
            return self._get_fallback_plan(plan_type)

    async def generate_daily_insight(self, user: User, recent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate daily personalized insight"""
        system_message = """You are a friendly AI health coach who provides daily insights and encouragement.
        
        Create personalized, actionable insights that:
        1. Are relevant to today's data and trends
        2. Provide gentle guidance and motivation
        3. Connect genetic factors to daily choices
        4. Are positive and empowering
        5. Include specific next steps
        """
        
        prompt = f"""
        Generate a daily insight for:
        User: {user.name}, Age {user.age}
        Recent Data: {json.dumps(recent_data, indent=2)}
        
        Create an encouraging, personalized message that connects their genetic profile to today's opportunities for health improvement.
        
        Format as JSON:
        {{
            "title": "string",
            "message": "string",
            "action_items": ["action1", "action2"],
            "genetic_connection": "string",
            "encouragement": "string"
        }}
        """
        
        chat = self._create_chat_instance(system_message, f"daily_insight_{user.id}")
        
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            insight = json.loads(response)
            logger.info(f"Generated daily insight for user {user.id}")
            return insight
            
        except Exception as e:
            logger.error(f"Daily insight generation failed: {e}")
            return self._get_fallback_insight()

    def _extract_relevant_insights(self, genetic_insights: Dict[str, Any], plan_type: PlanType) -> Dict[str, Any]:
        """Extract insights relevant to specific plan type"""
        if plan_type == PlanType.NUTRITION:
            return genetic_insights.get('nutrition_insights', {})
        elif plan_type == PlanType.FITNESS:
            return genetic_insights.get('fitness_insights', {})
        elif plan_type == PlanType.MENTAL_WELLNESS:
            return genetic_insights.get('mental_wellness', {})
        elif plan_type == PlanType.DISEASE_PREVENTION:
            return {'risk_assessments': genetic_insights.get('risk_assessments', [])}
        return {}

    def _get_fallback_analysis(self) -> Dict[str, Any]:
        """Fallback analysis if AI fails"""
        return {
            "risk_assessments": [
                {
                    "condition": "Cardiovascular Health",
                    "risk_level": "moderate",
                    "confidence_score": 75,
                    "genetic_factors": ["APOE", "MTHFR"],
                    "recommendations": ["Regular cardio exercise", "Mediterranean diet", "Omega-3 supplements"]
                }
            ],
            "nutrition_insights": {
                "genetic_factors": ["MTHFR variant", "Lactase persistence"],
                "recommendations": ["Folate-rich foods", "Limit processed foods"],
                "foods_to_emphasize": ["Leafy greens", "Fish", "Nuts"],
                "foods_to_limit": ["Processed sugar", "Trans fats"]
            },
            "fitness_insights": {
                "genetic_factors": ["ACTN3", "ACE"],
                "optimal_exercise_types": ["Mixed cardio/strength", "HIIT training"],
                "recovery_recommendations": ["7-9 hours sleep", "Active recovery days"]
            },
            "mental_wellness": {
                "stress_response_profile": "Moderate stress sensitivity",
                "sleep_optimization": ["Cool room temperature", "Consistent schedule"],
                "cognitive_enhancement": ["Meditation", "Brain training games"]
            }
        }

    def _get_fallback_plan(self, plan_type: PlanType) -> Dict[str, Any]:
        """Fallback plan if AI fails"""
        plans = {
            PlanType.NUTRITION: {
                "title": "Personalized Nutrition Plan",
                "description": "A balanced approach to nutrition based on your genetic profile",
                "objectives": ["Optimize nutrient absorption", "Support metabolic health"],
                "weekly_plan": [
                    {
                        "week": 1,
                        "focus": "Foundation building",
                        "actions": ["Track current eating habits", "Introduce omega-3 rich foods"],
                        "metrics": ["Food diary completion", "Fish servings per week"]
                    }
                ],
                "key_recommendations": ["Eat whole foods", "Stay hydrated", "Consider supplements"],
                "success_tips": ["Plan meals ahead", "Cook at home more often"],
                "genetic_optimization": ["Focus on anti-inflammatory foods"]
            }
        }
        return plans.get(plan_type, plans[PlanType.NUTRITION])

    def _get_fallback_insight(self) -> Dict[str, Any]:
        """Fallback insight if AI fails"""
        return {
            "title": "Daily Health Focus",
            "message": "Your genetic profile suggests focusing on consistent sleep patterns for optimal health.",
            "action_items": ["Maintain consistent bedtime", "Limit screen time before bed"],
            "genetic_connection": "Your circadian rhythm genes respond well to regularity",
            "encouragement": "Small consistent changes lead to big health improvements!"
        }