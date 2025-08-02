import React from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';

const MissionHeader = ({ 
  missionNumber, 
  missionTitle, 
  onBackToCodex, 
  showSidebar, 
  setShowSidebar 
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 border-b border-amber-400/30 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToCodex}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 rounded-xl transition-all duration-300 hover:scale-105 font-bold shadow-lg"
          >
            <ArrowLeft size={18} />
            <span>Back to Codex</span>
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-amber-300">Mission {missionNumber}</h1>
            <p className="text-amber-200 text-sm lg:text-base font-medium truncate max-w-md">{missionTitle}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-xl transition-all duration-300 border border-amber-600/30 hover:scale-105 font-bold"
        >
          {showSidebar ? <X size={18} /> : <Menu size={18} />}
          <span className="hidden lg:inline">
            {showSidebar ? 'Close Brief' : 'Mission Brief'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MissionHeader;