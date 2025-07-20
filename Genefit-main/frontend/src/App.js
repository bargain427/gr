import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./contexts/AppContext";
import HeroSection from "./components/HeroSection";
import HealthPlanCard from "./components/HealthPlanCard";
import Dashboard from "./components/Dashboard";
import DNAUpload from "./components/DNAUpload";
import WearablesSync from "./components/WearablesSync";
import UserSetup from "./components/UserSetup";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { healthPlans, testimonials } from "./data/mockData";

const AppContent = () => {
  const { user } = useApp();
  const [currentStep, setCurrentStep] = useState('hero'); // hero, setup, upload, wearables, dashboard

  // Determine initial step based on user state
  useEffect(() => {
    if (user) {
      // User exists, check if they have completed onboarding
      // For demo purposes, go straight to dashboard
      setCurrentStep('dashboard');
    } else {
      setCurrentStep('hero');
    }
  }, [user]);

  const handleGetStarted = () => {
    if (user) {
      setCurrentStep('dashboard');
    } else {
      setCurrentStep('setup');
    }
  };

  const handleSetupComplete = () => {
    setCurrentStep('upload');
  };

  const handleUploadComplete = () => {
    setCurrentStep('wearables');
  };

  const handleSyncComplete = () => {
    setCurrentStep('dashboard');
  };

  const handleExplorePlan = (plan) => {
    // In a real app, this would navigate to a detailed plan view
    console.log('Exploring plan:', plan);
    alert(`Exploring ${plan.title} - This would open a detailed view in a full implementation!`);
  };

  // Step-based rendering
  if (currentStep === 'setup') {
    return <UserSetup onComplete={handleSetupComplete} />;
  }

  if (currentStep === 'upload') {
    return <DNAUpload onUploadComplete={handleUploadComplete} />;
  }

  if (currentStep === 'wearables') {
    return <WearablesSync onSyncComplete={handleSyncComplete} />;
  }

  if (currentStep === 'dashboard') {
    return <Dashboard />;
  }

  // Default home page
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} />
      
      {/* Health Plans Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Personalized Health Plans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI-powered recommendations tailored to your unique genetic profile and lifestyle data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {healthPlans.map((plan) => (
              <HealthPlanCard 
                key={plan.id} 
                plan={plan} 
                onExplore={handleExplorePlan}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why GeneFit AI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combining cutting-edge genetic science with AI to deliver truly personalized health insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧬',
                title: 'Genetic Intelligence',
                description: 'Analyze 850+ genetic markers to understand your unique biological blueprint and health predispositions.'
              },
              {
                icon: '🤖',
                title: 'AI-Powered Insights',
                description: 'Advanced machine learning algorithms provide personalized recommendations that evolve with your progress.'
              },
              {
                icon: '📱',
                title: 'Real-Time Monitoring',
                description: 'Seamlessly connect wearables and health devices for continuous, comprehensive health tracking.'
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Health Professionals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how GeneFit AI is transforming personalized healthcare.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <blockquote className="text-gray-700 italic mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Unlock Your Genetic Potential?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands who have transformed their health with personalized, AI-powered insights.
          </p>
          
          <Button 
            onClick={handleGetStarted}
            className="px-8 py-4 text-lg bg-white text-gray-900 hover:bg-gray-100 rounded-full transform transition-all duration-300 hover:scale-105"
          >
            Get Started Today
            <span className="ml-2">🚀</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

const Home = () => <AppContent />;

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;