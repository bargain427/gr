import React from 'react';

const DNAStrand = ({ animated = true, size = 'large' }) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg
        className={`w-full h-full ${animated ? 'animate-pulse' : ''}`}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* DNA Double Helix */}
        <defs>
          <linearGradient id="dnaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#764ba2', stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="dnaGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#f093fb', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#f5576c', stopOpacity:1}} />
          </linearGradient>
        </defs>
        
        {/* Left Helix Strand */}
        <path
          d="M50 20 Q80 40, 50 60 Q20 80, 50 100 Q80 120, 50 140 Q20 160, 50 180"
          stroke="url(#dnaGradient1)"
          strokeWidth="4"
          fill="none"
          className={animated ? 'animate-pulse' : ''}
        />
        
        {/* Right Helix Strand */}
        <path
          d="M150 20 Q120 40, 150 60 Q180 80, 150 100 Q120 120, 150 140 Q180 160, 150 180"
          stroke="url(#dnaGradient2)"
          strokeWidth="4"
          fill="none"
          className={animated ? 'animate-pulse' : ''}
          style={{animationDelay: '0.5s'}}
        />
        
        {/* Base Pairs */}
        {[30, 50, 70, 90, 110, 130, 150, 170].map((y, index) => (
          <line
            key={index}
            x1="50"
            y1={y}
            x2="150"
            y2={y}
            stroke="#a78bfa"
            strokeWidth="2"
            opacity="0.6"
            className={animated ? 'animate-pulse' : ''}
            style={{animationDelay: `${index * 0.1}s`}}
          />
        ))}
        
        {/* Nucleotide Dots */}
        {[
          {x: 50, y: 30, color: '#ff6b6b'},
          {x: 150, y: 30, color: '#4ecdc4'},
          {x: 50, y: 70, color: '#45b7d1'},
          {x: 150, y: 70, color: '#96ceb4'},
          {x: 50, y: 110, color: '#feca57'},
          {x: 150, y: 110, color: '#ff9ff3'},
          {x: 50, y: 150, color: '#54a0ff'},
          {x: 150, y: 150, color: '#5f27cd'}
        ].map((dot, index) => (
          <circle
            key={index}
            cx={dot.x}
            cy={dot.y}
            r="4"
            fill={dot.color}
            className={animated ? 'animate-pulse' : ''}
            style={{animationDelay: `${index * 0.2}s`}}
          />
        ))}
      </svg>
      
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full animate-spin-slow opacity-30"></div>
      )}
    </div>
  );
};

export default DNAStrand;