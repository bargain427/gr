import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import DNAStrand from './DNAStrand';
import AIAvatar from './AIAvatar';

const HeroSection = ({ onGetStarted }) => {
  const [textIndex, setTextIndex] = useState(0);
  const rotatingTexts = [
    'Your Genes. Your Plan. Your Life.',
    'Unlock Your Genetic Potential.',
    'Personalized Health, Powered by AI.',
    'Your DNA, Your Destiny.'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-pink-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-green-300/25 to-teal-300/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen">
          {/* Left Column - Content */}
          <div className="flex-1 space-y-8 lg:pr-12">
            {/* AI Avatar */}
            <div className="flex items-center space-x-4">
              <AIAvatar isActive={true} size="large" />
              <div className="text-sm text-gray-600 font-medium">
                AI Health Companion Active
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                GeneFit AI
              </h1>
              
              {/* Rotating Tagline */}
              <div className="h-20 overflow-hidden">
                <p 
                  className="text-2xl lg:text-3xl font-medium text-gray-700 transition-transform duration-1000 ease-in-out transform"
                  key={textIndex}
                  style={{
                    transform: `translateY(${textIndex * -100}%)`,
                    animation: 'slideInFromBottom 1s ease-out'
                  }}
                >
                  {rotatingTexts[textIndex]}
                </p>
              </div>

              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                Transform your health journey with AI-powered insights from your DNA. 
                Get personalized nutrition, fitness, and wellness plans that evolve with you, 
                backed by cutting-edge genetic science and real-time health monitoring.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onGetStarted}
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Start Your Journey
                <span className="ml-2">🧬</span>
              </Button>
              
              <Button 
                variant="outline"
                className="px-8 py-4 text-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-full transform transition-all duration-300 hover:scale-105"
              >
                Watch Demo
                <span className="ml-2">▶️</span>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">850+</div>
                <div className="text-sm text-gray-600">Genetic Markers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">AI Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right Column - DNA Visualization */}
          <div className="flex-1 flex justify-center items-center relative">
            <div className="relative">
              <DNAStrand size="xl" animated={true} />
              
              {/* Orbiting Data Points */}
              <div className="absolute inset-0 animate-spin-slow">
                {['🔬', '💊', '🏃', '🧠', '❤️', '🍎'].map((emoji, index) => (
                  <div
                    key={index}
                    className="absolute w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-bounce"
                    style={{
                      top: `${20 + Math.sin((index * Math.PI) / 3) * 30}%`,
                      left: `${50 + Math.cos((index * Math.PI) / 3) * 40}%`,
                      animationDelay: `${index * 0.5}s`
                    }}
                  >
                    <span className="text-xl">{emoji}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;