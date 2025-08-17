import React from 'react';

const LoadingState = ({ missionNumber }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500 text-gray-900 font-mono flex items-center justify-center">
      <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-2xl border border-white/30">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600/30 border-t-gray-600 mx-auto mb-6"></div>
        <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Loading Mission {missionNumber}</h2>
        <p className="text-gray-800 font-medium">Preparing your learning environment...</p>
      </div>
    </div>
  );
};

export default LoadingState;