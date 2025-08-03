import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative">
      <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-600 rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-900 mt-4 font-bold">Loading posts...</p>
  </div>
);

export default LoadingSpinner;