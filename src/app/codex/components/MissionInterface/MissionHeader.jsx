import React from 'react';
import { ArrowLeft } from 'lucide-react';

const MissionHeader = ({ missionNumber, missionTitle, onBackToCodex }) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 border-b border-amber-400/30 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToCodex}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-xl transition-all duration-300 border border-amber-600/30 hover:scale-105 font-bold"
          >
            <ArrowLeft size={18} />
            <span>Back to Codex</span>
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-amber-300">Mission {missionNumber}</h1>
            <p className="text-amber-200 text-sm lg:text-base font-medium">{missionTitle}</p>
          </div>
        </div>
        <div className="text-sm text-amber-200 bg-amber-100/10 px-3 py-2 rounded-lg border border-amber-400/30">
          <span className="font-bold">🤖 AI-Guided Mission</span>
        </div>
      </div>
    </div>
  );
};

export default MissionHeader;