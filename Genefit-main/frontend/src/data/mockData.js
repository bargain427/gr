// Mock data for GeneFit AI platform

export const healthPlans = [
  {
    id: 'nutrition',
    title: 'Personalized Nutrition',
    icon: '🍎',
    description: 'AI-crafted meal plans based on your genetic predispositions',
    insights: [
      'Optimal macronutrient ratios for your metabolism',
      'Foods that complement your genetic markers',
      'Personalized supplement recommendations'
    ],
    progress: 85,
    nextAction: 'Review your weekly meal prep suggestions'
  },
  {
    id: 'fitness',
    title: 'Smart Fitness',
    icon: '💪',
    description: 'Workouts optimized for your genetic muscle fiber composition',
    insights: [
      'Exercise types that maximize your genetic potential',
      'Recovery patterns based on your DNA',
      'Injury prevention strategies'
    ],
    progress: 72,
    nextAction: 'Start your power-endurance hybrid program'
  },
  {
    id: 'mental-wellness',
    title: 'Mental Wellness',
    icon: '🧠',
    description: 'Cognitive enhancement through genetic-informed practices',
    insights: [
      'Stress response patterns from your genes',
      'Optimal meditation and mindfulness techniques',
      'Sleep optimization based on circadian genetics'
    ],
    progress: 90,
    nextAction: 'Try your personalized breathwork session'
  },
  {
    id: 'disease-prevention',
    title: 'Disease Prevention',
    icon: '🛡️',
    description: 'Proactive health monitoring based on genetic risk factors',
    insights: [
      'Early screening recommendations',
      'Lifestyle modifications for risk reduction',
      'Personalized health monitoring schedule'
    ],
    progress: 68,
    nextAction: 'Schedule your genetic counseling session'
  }
];

export const aiInsights = {
  dailyTip: "Based on your APOE4 variant, incorporating omega-3 rich foods like wild salmon can support cognitive function. Today's meal suggestion includes a Mediterranean-style lunch.",
  riskFactors: [
    { factor: 'Cardiovascular Health', risk: 'Low', confidence: 94 },
    { factor: 'Type 2 Diabetes', risk: 'Moderate', confidence: 87 },
    { factor: 'Cognitive Decline', risk: 'Low', confidence: 91 },
    { factor: 'Osteoporosis', risk: 'High', confidence: 89 }
  ],
  geneticMarkers: {
    analyzed: 847,
    total: 900,
    lastUpdated: '2 hours ago'
  }
};

export const wearableData = {
  steps: 8547,
  heartRate: 72,
  sleep: 7.3,
  calories: 1847,
  activeMinutes: 42,
  syncStatus: 'Connected',
  devices: ['Apple Watch', 'Fitbit Charge 5']
};

export const userProfile = {
  name: 'Sarah',
  age: 32,
  geneticProfile: 'Analyzed',
  wearablesConnected: 2,
  plansActive: 4,
  completionRate: 79
};

export const testimonials = [
  {
    name: 'Dr. Emily Chen',
    role: 'Genetic Counselor',
    quote: 'GeneFit AI bridges the gap between complex genetic data and actionable health insights.',
    avatar: '👩‍⚕️'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Fitness Enthusiast',
    quote: 'My workouts are 40% more effective since discovering my genetic fitness profile.',
    avatar: '🏃‍♂️'
  },
  {
    name: 'Lisa Thompson',
    role: 'Nutrition Coach',
    quote: 'The personalized meal plans based on genetics have transformed my clients\' results.',
    avatar: '🥗'
  }
];

export const dnaUploadSteps = [
  {
    step: 1,
    title: 'Upload Your DNA Report',
    description: 'Support for 23andMe, AncestryDNA, MyHeritage, and more',
    icon: '📄'
  },
  {
    step: 2,
    title: 'AI Analysis',
    description: 'Our advanced algorithms analyze 850+ genetic markers',
    icon: '🤖'
  },
  {
    step: 3,
    title: 'Personalized Insights',
    description: 'Receive your custom health and lifestyle recommendations',
    icon: '✨'
  },
  {
    step: 4,
    title: 'Continuous Evolution',
    description: 'Your plan adapts as new research and data become available',
    icon: '🔄'
  }
];

export const aiAvatarMessages = [
  "Hello! I'm analyzing your latest biometric data...",
  "Your genetic markers suggest trying a Mediterranean diet pattern.",
  "I notice your sleep quality improved 15% this week. Great progress!",
  "Based on your workout completion, I'm adjusting your recovery protocol.",
  "Your stress markers indicate it's time for some mindfulness practice."
];