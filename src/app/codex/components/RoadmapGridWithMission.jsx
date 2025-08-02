import React from 'react';
import { Play } from 'lucide-react';
import RoadmapGrid from './RoadmapGrid';

const RoadmapGridWithMission = ({ missions, username, onStartMission }) => {
  // Convert missions object to array for easier processing
  const missionsArray = missions && typeof missions === 'object' 
    ? Object.entries(missions).map(([key, mission]) => ({ ...mission, id: key }))
    : [];
  
  return (
    <div className="space-y-6">
      {/* Active Mission Highlight */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm rounded-xl p-6 border border-amber-400/30 shadow-xl">
        <h3 className="text-lg lg:text-xl font-black text-amber-300 mb-4 flex items-center gap-2">
          Current Mission
        </h3>
        {(() => {
          if (missionsArray.length === 0) {
            return (
              <p className="text-amber-200">No missions available yet.</p>
            );
          }

          const activeMission = missionsArray.find(mission => mission.status === "active");
          if (activeMission) {
            const missionNumber = missionsArray.findIndex(mission => mission.id === activeMission.id) + 1;
            return (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-black text-amber-300 text-lg">Mission {missionNumber}: {activeMission.title.replace(/\\n/g,"")}</h4>
                  <p className="text-amber-200 text-sm mt-2 leading-relaxed">
                    {activeMission.description ? activeMission.description.substring(0, 100) + '...' : 
                     activeMission.content ? activeMission.content.substring(0, 100) + '...' : 'No description available'}
                  </p>
                </div>
                <button
                  onClick={onStartMission}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-xl transition-all duration-300 transform hover:scale-105 text-gray-900 font-bold shadow-lg"
                >
                  <Play size={18} />
                  <span>Start Mission</span>
                </button>
              </div>
            );
          } else {
            // Check if all missions are completed or if we need to set the first one as active
            const completedMissions = missionsArray.filter(mission => mission.status === "completed");
            if (completedMissions.length === missionsArray.length) {
              return (
                <div className="text-center py-4">
                  <span className="text-4xl mb-2 block">🎉</span>
                  <p className="text-amber-300 font-bold text-lg">All missions completed! Great work!</p>
                </div>
              );
            } else {
              // Find the first mission without completed status to make it active
              const firstIncomplete = missionsArray.find(mission => mission.status !== "completed");
              if (firstIncomplete) {
                const missionNumber = missionsArray.findIndex(mission => mission.id === firstIncomplete.id) + 1;
                return (
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-black text-amber-300 text-lg">Mission {missionNumber}: {firstIncomplete.title}</h4>
                      <p className="text-amber-200 text-sm mt-2 leading-relaxed">
                        {firstIncomplete.description ? firstIncomplete.description.substring(0, 100) + '...' : 
                         firstIncomplete.content ? firstIncomplete.content.substring(0, 100) + '...' : 'No description available'}
                      </p>
                    </div>
                    <button
                      onClick={onStartMission}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-xl transition-all duration-300 transform hover:scale-105 text-gray-900 font-bold shadow-lg"
                    >
                      <Play size={18} />
                      <span>Start Mission</span>
                    </button>
                  </div>
                );
              }
              return (
                <p className="text-amber-200">No active missions available.</p>
              );
            }
          }
        })()}
      </div>

      {/* Original RoadmapGrid content */}
      <RoadmapGrid missions={missions} username={username} />
    </div>
  );
};

export default RoadmapGridWithMission;