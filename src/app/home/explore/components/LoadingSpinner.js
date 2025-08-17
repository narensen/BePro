import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-gray-300 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
    </div>
    <p className="text-white/80 mt-4 font-medium">Loading posts...</p>
  </div>
);

export default LoadingSpinner;