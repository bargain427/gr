import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { aiAvatarMessages } from '../data/mockData';

const AIAvatar = ({ isActive = false, size = 'medium' }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentMessage((prev) => (prev + 1) % aiAvatarMessages.length);
          setIsAnimating(false);
        }, 200);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="relative">
      {/* Avatar Circle */}
      <div className={`${sizeClasses[size]} relative overflow-hidden rounded-full ${isActive ? 'animate-pulse' : ''}`}>
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>
        
        {/* AI Face/Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
          🤖
        </div>
        
        {/* Animated Ring */}
        {isActive && (
          <div className="absolute -inset-2 rounded-full border-2 border-blue-400/50 animate-ping"></div>
        )}
        
        {/* Neural Network Animation */}
        {isActive && (
          <div className="absolute inset-0">
            <div className="absolute top-2 left-2 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="absolute top-4 right-3 w-1 h-1 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-3 left-3 w-1 h-1 bg-pink-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-2 right-2 w-1 h-1 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          </div>
        )}
      </div>

      {/* Message Bubble */}
      {isActive && (
        <Card className={`absolute ${size === 'small' ? 'left-16 top-0' : 'left-20 top-0'} p-3 bg-white/95 backdrop-blur-sm shadow-lg border-0 max-w-xs z-10 transform transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
          <div className="text-sm text-gray-700 font-medium">
            {aiAvatarMessages[currentMessage]}
          </div>
          <div className="absolute -left-2 top-4 w-0 h-0 border-r-8 border-r-white/95 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </Card>
      )}

      {/* Status Indicator */}
      {isActive && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse">
          <div className="absolute inset-1 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default AIAvatar;