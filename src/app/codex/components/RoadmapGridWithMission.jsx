import React from 'react';
import { Play } from 'lucide-react';
import RoadmapGrid from './RoadmapGrid';

const RoadmapGridWithMission = ({ missions, username, onStartMission }) => {
  const missionsArray = missions && typeof missions === 'object' 
    ? Object.entries(missions).map(([key, mission]) => ({ ...mission, id: key }))
    : [];

  const renderCurrentMission = () => {
    if (missionsArray.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-amber-200/80 text-lg">No missions available yet.</p>
        </div>
      );
    }

    const activeMission = missionsArray.find(mission => mission.status === "active");
    
    if (activeMission) {
      const missionNumber = missionsArray.findIndex(mission => mission.id === activeMission.id) + 1;
      return (
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <h4 className="font-black text-amber-300 text-xl">Mission {missionNumber}</h4>
            </div>
            <p className="text-amber-100/90 text-base leading-relaxed max-w-2xl">
              {activeMission.description 
                ? activeMission.description.length > 150 
                  ? activeMission.description.substring(0, 150) + '...'
                  : activeMission.description
                : activeMission.content 
                  ? activeMission.content.length > 150
                    ? activeMission.content.substring(0, 150) + '...'
                    : activeMission.content
                  : 'No description available'
              }
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onStartMission}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-gray-900 font-bold text-lg shadow-lg border border-yellow-300/50"
            >
              <Play size={20} className="drop-shadow-sm" />
              <span>Start Mission</span>
            </button>
          </div>
        </div>
      );
    }

    const completedMissions = missionsArray.filter(mission => mission.status === "completed");
    
    if (completedMissions.length === missionsArray.length) {
      return (
        <div className="text-center py-8">
          <div className="mb-4">
            <span className="text-6xl block animate-bounce">🎉</span>
          </div>
          <h4 className="text-amber-300 font-black text-2xl mb-2">Mission Complete!</h4>
          <p className="text-amber-100/80 text-lg">All missions completed. Outstanding work!</p>
        </div>
      );
    }

    const firstIncomplete = missionsArray.find(mission => mission.status !== "completed");
    
    if (firstIncomplete) {
      const missionNumber = missionsArray.findIndex(mission => mission.id === firstIncomplete.id) + 1;
      return (
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400/60 rounded-full"></div>
              <h4 className="font-black text-amber-300 text-xl">
                Mission {missionNumber}: {firstIncomplete.title}
              </h4>
            </div>
            <p className="text-amber-100/90 text-base leading-relaxed max-w-2xl">
              {firstIncomplete.description 
                ? firstIncomplete.description.length > 150 
                  ? firstIncomplete.description.substring(0, 150) + '...'
                  : firstIncomplete.description
                : firstIncomplete.content 
                  ? firstIncomplete.content.length > 150
                    ? firstIncomplete.content.substring(0, 150) + '...'
                    : firstIncomplete.content
                  : 'No description available'
              }
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onStartMission}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-gray-900 font-bold text-lg shadow-lg border border-yellow-300/50"
            >
              <Play size={20} className="drop-shadow-sm" />
              <span>Start Mission</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <p className="text-amber-200/80 text-lg">No active missions available.</p>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Current Mission Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm rounded-xl p-8 border border-amber-400/30 shadow-xl">
        <div className="mb-6">
          <h3 className="text-2xl font-black text-amber-300 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full"></div>
            Current Mission
          </h3>
        </div>
        {renderCurrentMission()}
      </div>

      {/* Roadmap Grid */}
      <RoadmapGrid missions={missions} username={username} />
    </div>
  );
};

export default RoadmapGridWithMission;