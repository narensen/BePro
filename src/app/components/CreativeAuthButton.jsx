'use client'

import React, { useState } from 'react';

const CreativeAuthButton = ({ 
  onSignIn, 
  onSignUp, 
  onClick, // Single click handler if both go to same page
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { width: 'w-32', height: 'h-12', text: 'text-xs', padding: 'p-2' },
    default: { width: 'w-40', height: 'h-14', text: 'text-sm', padding: 'p-3' },
    large: { width: 'w-48', height: 'h-16', text: 'text-base', padding: 'p-4' }
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative ${className}`}>
      {/* Main button container */}
      <div 
        className={`relative ${config.width} ${config.height} cursor-pointer group rounded-xl overflow-hidden shadow-lg`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }}
      >
        
        {/* Sign In section (left half) */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center ${config.padding} bg-gray-900 text-amber-300 transition-all duration-300 hover:bg-gray-800 border-r border-amber-400/30`}
          onClick={onClick || onSignIn}
        >
          <span className={`font-bold ${config.text} tracking-wide`}>
            Sign In
          </span>
        </div>

        {/* Sign Up section (right half) */}
        <div 
          className={`absolute top-0 right-0 w-1/2 h-full flex items-center justify-center ${config.padding} bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 transition-all duration-300 hover:from-yellow-400 hover:to-amber-400`}
          onClick={onClick || onSignUp}
        >
          <span className={`font-bold ${config.text} tracking-wide`}>
            Sign Up
          </span>
        </div>

        {/* Subtle divider line */}
        <div className="absolute top-2 bottom-2 left-1/2 w-px bg-amber-400/40 transform -translate-x-0.5" />
        
        {/* Hover overlay effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: 'translateX(-100%)',
            animation: isHovered ? 'shimmer 0.8s ease-out' : 'none'
          }}
        />
      </div>

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default CreativeAuthButton;