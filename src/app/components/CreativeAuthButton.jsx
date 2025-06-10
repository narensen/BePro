'use client'

import React, { useState } from 'react';

const GetStartedButton = ({ 
  onClick, 
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { width: 'w-36', height: 'h-12', text: 'text-sm', padding: 'p-3' },
    default: { width: 'w-44', height: 'h-14', text: 'text-base', padding: 'p-4' },
    large: { width: 'w-52', height: 'h-16', text: 'text-lg', padding: 'p-5' }
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative ${className}`}>
      {/* Main button container */}
      <div 
        className={`relative ${config.width} ${config.height} cursor-pointer group rounded-2xl overflow-hidden shadow-xl`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        style={{
          transform: isHovered ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400" />
        
        {/* Animated background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(0, 0, 0, 0.1) 8px,
              rgba(0, 0, 0, 0.1) 9px
            )`,
            transform: isHovered ? 'translateX(20px)' : 'translateX(0px)',
            transition: 'transform 0.4s ease'
          }}
        />

        {/* Main content */}
        <div className={`relative z-10 w-full h-full flex items-center justify-center ${config.padding}`}>
          <span 
            className={`font-black ${config.text} text-black tracking-wide transition-transform duration-300`}
            style={{
              transform: isHovered ? 'translateX(4px)' : 'translateX(0px)'
            }}
          >
            Get Started
          </span>
        </div>

        {/* Subtle border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-black/20" />
        
        {/* Hover shimmer effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none rounded-2xl"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: 'translateX(-100%)',
            animation: isHovered ? 'shimmer 0.8s ease-out' : 'none'
          }}
        />

        {/* Bottom glow effect */}
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-yellow-400/50 rounded-full blur-sm transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0
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

export default GetStartedButton;