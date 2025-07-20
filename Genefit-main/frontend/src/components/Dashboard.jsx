import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useApp } from '../contexts/AppContext';
import { insightsAPI, healthPlansAPI } from '../services/api';
import AIAvatar from './AIAvatar';

const Dashboard = () => {
  const { user, dashboardData, refreshDashboard } = useApp();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [animatedValues, setAnimatedValues] = useState({
    steps: 0,
    heartRate: 0,
    sleep: 0,
    calories: 0
  });
  const [dailyInsight, setDailyInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dashboardData) {
      setLoading(false);
      
      // Animate counter values
      const wearableData = dashboardData.wearable_data || {
        steps: 0,
        heart_rate: 0,
        sleep: 0,
        calories: 0
      };
      
      const duration = 2000;
      const interval = 50;
      const steps = duration / interval;
      
      const animate = (key, targetValue) => {
        let currentStep = 0;
        const increment = targetValue / steps;
        
        const timer = setInterval(() => {
          currentStep++;
          const currentValue = Math.min(increment * currentStep, targetValue);
          
          setAnimatedValues(prev => ({
            ...prev,
            [key]: key === 'sleep' ? currentValue.toFixed(1) : Math.floor(currentValue)
          }));
          
          if (currentStep >= steps) {
            clearInterval(timer);
          }
        }, interval);
      };

      animate('steps', wearableData.steps || 0);
      animate('heartRate', wearableData.heart_rate || 0);
      animate('sleep', wearableData.sleep || 0);
      animate('calories', wearableData.calories || 0);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (user && !dailyInsight) {
      generateDailyInsight();
    }
  }, [user, dailyInsight]);

  const generateDailyInsight = async () => {
    try {
      const insight = await insightsAPI.generateDailyInsight(user.id);
      setDailyInsight(insight);
    } catch (error) {
      console.error('Error generating daily insight:', error);
    }
  };

  const createHealthPlan = async (planType) => {
    try {
      await healthPlansAPI.create(user.id, planType);
      await refreshDashboard();
      alert(`${planType} plan created successfully!`);
    } catch (error) {
      console.error('Error creating health plan:', error);
      alert('Failed to create health plan. Please try again.');
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🧬</div>
          <p className="text-xl text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  const wearableData = dashboardData.wearable_data || {};
  const riskAssessments = dashboardData.risk_assessments || [];
  const healthPlans = dashboardData.health_plans || [];
  const dnaReports = dashboardData.dna_reports || [];
  const wellnessScore = dashboardData.wellness_score || 65;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'genetics', label: 'Genetic Insights', icon: '🧬' },
    { id: 'wellness', label: 'Wellness Score', icon: '💚' },
    { id: 'recommendations', label: 'AI Recommendations', icon: '🤖' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </div>
            <AIAvatar isActive={true} size="medium" />
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {wearableData.sync_status || 'Connected'}
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshDashboard}>
              Sync Data
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Steps Today', value: animatedValues.steps, unit: '', color: 'from-blue-500 to-blue-600', icon: '👟' },
                { label: 'Heart Rate', value: animatedValues.heartRate, unit: 'bpm', color: 'from-red-500 to-red-600', icon: '❤️' },
                { label: 'Sleep Quality', value: animatedValues.sleep, unit: 'hrs', color: 'from-purple-500 to-purple-600', icon: '😴' },
                { label: 'Calories', value: animatedValues.calories, unit: 'kcal', color: 'from-orange-500 to-orange-600', icon: '🔥' }
              ].map((stat, index) => (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10`}></div>
                  <CardContent className="relative z-10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {stat.value}{stat.unit}
                        </div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                      <div className="text-3xl">{stat.icon}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Daily AI Insight */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>Today's AI Insight</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {dailyInsight?.message || "Your personalized insights are being generated..."}
                </p>
                {dailyInsight?.action_items && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Action Items:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {dailyInsight.action_items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Genetic Insights Tab */}
        {selectedTab === 'genetics' && (
          <div className="space-y-6">
            {/* Genetic Analysis Progress */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🧬</span>
                  <span>Genetic Analysis Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Markers Analyzed</span>
                  <span className="font-bold text-lg">
                    {dnaReports.length > 0 ? `${dnaReports[0].markers_analyzed || 0} / ${dnaReports[0].total_markers || 0}` : '0 / 0'}
                  </span>
                </div>
                <Progress 
                  value={dnaReports.length > 0 ? ((dnaReports[0].markers_analyzed || 0) / Math.max(dnaReports[0].total_markers || 1, 1)) * 100 : 0} 
                  className="h-3"
                />
                <div className="text-sm text-gray-500">
                  Last updated: {dnaReports.length > 0 && dnaReports[0].analyzed_at 
                    ? new Date(dnaReports[0].analyzed_at).toLocaleString() 
                    : 'No analysis yet'}
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>Health Risk Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskAssessments.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{risk.condition}</div>
                        <div className="text-sm text-gray-600">
                          Confidence: {risk.confidence_score}%
                        </div>
                      </div>
                      <Badge 
                        variant={risk.risk_level === 'low' ? 'default' : risk.risk_level === 'moderate' ? 'secondary' : 'destructive'}
                        className="ml-4"
                      >
                        {risk.risk_level} Risk
                      </Badge>
                    </div>
                  ))}
                  {riskAssessments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No risk assessments available yet.</p>
                      <p className="text-sm">Upload your DNA report to get personalized risk analysis.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wellness Score Tab */}
        {selectedTab === 'wellness' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>💚</span>
                  <span>Overall Wellness Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="20"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="url(#wellnessGradient)"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeDasharray={`${wellnessScore * 5.03} 502`}
                      className="animate-pulse"
                    />
                    <defs>
                      <linearGradient id="wellnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{wellnessScore}%</div>
                      <div className="text-sm text-gray-600">Wellness Score</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{healthPlans.length}</div>
                    <div className="text-sm text-gray-600">Active Plans</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dnaReports.length}</div>
                    <div className="text-sm text-gray-600">DNA Reports</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Recommendations Tab */}
        {selectedTab === 'recommendations' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No health plans created yet</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => createHealthPlan('nutrition')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Create Nutrition Plan
                      </Button>
                      <Button 
                        onClick={() => createHealthPlan('fitness')}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Create Fitness Plan
                      </Button>
                      <Button 
                        onClick={() => createHealthPlan('mental_wellness')}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Create Wellness Plan
                      </Button>
                      <Button 
                        onClick={() => createHealthPlan('disease_prevention')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Create Prevention Plan
                      </Button>
                    </div>
                  </div>
                ) : (
                  healthPlans.map((plan, index) => (
                    <div key={index} className="p-4 bg-white/80 rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xl">
                              {plan.plan_type === 'nutrition' ? '🍎' : 
                               plan.plan_type === 'fitness' ? '💪' :
                               plan.plan_type === 'mental_wellness' ? '🧠' : '🛡️'}
                            </span>
                            <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(plan.progress || 0)}% Complete
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                          <Button size="sm" variant="outline">
                            View Plan Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;