import React from 'react';
import { ArrowLeft, Target, Clock } from 'lucide-react';

const MissionHeader = ({ 
  missionNumber, 
  missionTitle, 
  onBackToCodex, 
  showSidebar, 
  setShowSidebar,
}) => {
  return (
    <div className="relative backdrop-blur-3xl bg-gradient-to-r from-amber-900/20 via-yellow-900/10 to-amber-900/20 border-b border-amber-400/30 shadow-2xl safe-top">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent"></div>
      
      <div className="relative mobile:p-3 p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center mobile:space-x-3 space-x-6">
            <button
              onClick={onBackToCodex}
              className="touch-target group flex items-center mobile:space-x-2 space-x-3 mobile:px-3 mobile:py-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl font-bold shadow-lg active:scale-95"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="mobile:text-sm">Back to Codex</span>
            </button>
            
            <div className="flex mobile:flex-row mobile:items-center mobile:space-x-3 mobile:space-y-0 flex-col space-y-2">
              <div className="flex items-center mobile:space-x-2 space-x-4">
                <span className="text-amber-400/70 mobile:text-xs text-sm font-semibold uppercase tracking-wider">Mission</span>
                <div className="mobile:h-4 h-6 w-px bg-amber-400/30"></div>
                <span className="text-amber-300 mobile:text-xl text-2xl lg:text-3xl font-black">
                  {String(missionNumber).padStart(2, '0')}
                </span>
              </div>
              <h1 className="mobile:text-base text-xl lg:text-2xl font-bold text-amber-200 leading-tight mobile:truncate max-w-full">
                {missionTitle.replace(/\\n/g, "")}
              </h1>
            </div>
          </div>

          {/* Mobile sidebar toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="touch-target mobile:flex hidden items-center justify-center w-10 h-10 bg-amber-400/20 hover:bg-amber-400/30 rounded-lg transition-all duration-300 active:scale-95"
              aria-label="Toggle sidebar"
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <div className={`w-full h-0.5 bg-amber-300 transition-all duration-300 ${showSidebar ? 'rotate-45 translate-y-1' : ''}`}></div>
                <div className={`w-full h-0.5 bg-amber-300 transition-all duration-300 ${showSidebar ? 'opacity-0' : ''}`}></div>
                <div className={`w-full h-0.5 bg-amber-300 transition-all duration-300 ${showSidebar ? '-rotate-45 -translate-y-1' : ''}`}></div>
              </div>
            </button>
            <div className="hidden md:flex items-center space-x-4"> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionHeader;