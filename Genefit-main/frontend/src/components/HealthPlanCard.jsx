import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

const HealthPlanCard = ({ plan, onExplore }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-500 cursor-pointer border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 ${
        isHovered ? 'scale-105' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onExplore(plan)}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
      
      {/* Animated Background Orbs */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-pink-300/30 to-orange-300/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-4xl mb-2 transform transition-transform duration-300 group-hover:scale-110">
            {plan.icon}
          </div>
          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
            {plan.progress}% Complete
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-gray-800 mb-2">
          {plan.title}
        </CardTitle>
        <p className="text-gray-600 text-sm leading-relaxed">
          {plan.description}
        </p>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{plan.progress}%</span>
          </div>
          <Progress value={plan.progress} className="h-2 bg-white/60" />
        </div>
        
        {/* Key Insights */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700 text-sm">Key Insights:</h4>
          <ul className="space-y-1">
            {plan.insights.slice(0, 2).map((insight, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Next Action */}
        <div className="pt-2 border-t border-gray-200/50">
          <p className="text-xs text-gray-500 mb-2">Next Action:</p>
          <p className="text-sm font-medium text-gray-700 mb-3">{plan.nextAction}</p>
          
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 transform transition-all duration-200 hover:scale-105"
            size="sm"
          >
            Explore Plan
            <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Button>
        </div>
      </CardContent>
      
      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
    </Card>
  );
};

export default HealthPlanCard;