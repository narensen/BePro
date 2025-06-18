'use client'

import React, { useState } from 'react';

const GetStartedButton = ({ onClick, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        className={`
          relative w-44 h-14 px-5 py-4
          bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
          text-amber-300 font-bold text-base rounded-xl
          border-2 border-amber-400/30
          overflow-hidden
          transition-all duration-200 ease-out
          hover:border-amber-400
          hover:bg-gradient-to-r hover:from-gray-800 hover:via-gray-700 hover:to-gray-800
          active:scale-98
          group
          cursor-pointer
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={onClick}
      >
        {/* Simple highlight effect */}
        <div 
          className="absolute inset-0 bg-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
        
        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          <span className="font-black tracking-wide">
            Get Started
          </span>
          
          {/* Simple arrow */}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-colors duration-200"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
        
        {/* Subtle click feedback */}
        {isPressed && (
          <div className="absolute inset-0 bg-amber-400/10 rounded-xl" />
        )}
      </button>
    </div>
  );
};

export default GetStartedButton;