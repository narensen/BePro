import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white">
    <div className="relative">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-500 mt-4 font-medium">Loading posts...</p>
  </div>
);

export default LoadingSpinner;