'use client'

import React from 'react';

const GetStartedButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
        text-amber-300 font-black text-lg
        px-8 py-4 rounded-xl
        shadow-lg hover:shadow-xl
        hover:scale-105
        transition-all duration-300
        cursor-pointer
        ${className}
      `}
    >
      Get Started →
    </button>
  );
};

export default GetStartedButton;