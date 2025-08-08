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
    <div className="relative backdrop-blur-3xl bg-gradient-to-r from-amber-900/20 via-yellow-900/10 to-amber-900/20 border-b border-amber-400/30 shadow-2xl">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent"></div>
      
      <div className="relative p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBackToCodex}
              className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl font-bold shadow-lg"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Back to Codex</span>
            </button>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-amber-400/70 text-sm font-semibold uppercase tracking-wider">Mission</span>
                <div className="h-6 w-px bg-amber-400/30"></div>
                <span className="text-amber-300 text-2xl lg:text-3xl font-black">
                  {String(missionNumber).padStart(2, '0')}
                </span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-amber-200 leading-tight">
                {missionTitle.replace(/\\n/g, "")}
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4"> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionHeader;