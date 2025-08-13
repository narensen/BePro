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
        <div className="text-center py-12">
          <div className="mb-6 opacity-60">
            <span className="text-6xl">🎯</span>
          </div>
          <p className="text-muted-foreground text-xl font-medium">No missions available yet.</p>
          <p className="text-muted-foreground/60 text-lg mt-2">Check back soon for new challenges!</p>
        </div>
      );
    }

    const activeMission = missionsArray.find(mission => mission.status === "active");
    
    if (activeMission) {
      const missionNumber = missionsArray.findIndex(mission => mission.id === activeMission.id) + 1;
      return (
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-chart-1 rounded-full animate-pulse shadow-lg shadow-chart-1/50"></div>
                <div className="absolute inset-0 w-3 h-3 bg-chart-1 rounded-full animate-ping opacity-30"></div>
              </div>
              <h4 className="font-black bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent text-2xl">
                Mission {missionNumber}
              </h4>
            </div>
            <p className="text-muted-foreground/80 text-lg leading-relaxed max-w-2xl font-medium">
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
              className="group relative flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 text-primary-foreground font-black text-xl shadow-2xl hover:shadow-amber-400/25 border border-amber-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
              <Play size={24} className="relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
              <span className="relative z-10 drop-shadow-sm">Start Mission</span>
            </button>
          </div>
        </div>
      );
    }

    const completedMissions = missionsArray.filter(mission => mission.status === "completed");
    
    if (completedMissions.length === missionsArray.length) {
      return (
        <div className="text-center py-12">
          <div className="relative mb-8">
            <span className="text-8xl block animate-bounce drop-shadow-2xl">🎉</span>
            <div className="absolute inset-0 animate-pulse">
              <span className="text-8xl block opacity-20">✨</span>
            </div>
          </div>
          <h4 className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent font-black text-4xl mb-4 animate-pulse">
            Mission Complete!
          </h4>
          <p className="text-muted-foreground text-xl font-medium">All missions completed. Outstanding work!</p>
        </div>
      );
    }

    const firstIncomplete = missionsArray.find(mission => mission.status !== "completed");
    
    if (firstIncomplete) {
      const missionNumber = missionsArray.findIndex(mission => mission.id === firstIncomplete.id) + 1;
      return (
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-muted-foreground/40 rounded-full"></div>
              <h4 className="font-black text-foreground text-2xl">
                Mission {missionNumber}: {firstIncomplete.title}
              </h4>
            </div>
            <p className="text-muted-foreground/70 text-lg leading-relaxed max-w-2xl font-medium">
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
              className="group relative flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 text-primary-foreground font-black text-xl shadow-2xl hover:shadow-amber-400/25 border border-amber-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
              <Play size={24} className="relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
              <span className="relative z-10 drop-shadow-sm">Start Mission</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <div className="mb-6 opacity-50">
          <span className="text-6xl">⏳</span>
        </div>
        <p className="text-muted-foreground text-xl font-medium">No active missions available.</p>
        <p className="text-muted-foreground/60 text-lg mt-2">Complete current missions to unlock new ones!</p>
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      {/* Current Mission Section */}
      <div className="relative group bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 backdrop-blur-lg rounded-2xl p-8 border border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative mb-8">
          <h3 className="text-3xl font-black bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent flex items-center gap-4">
            <div className="w-2 h-10 bg-gradient-to-b from-primary via-chart-1 to-chart-2 rounded-full animate-pulse shadow-lg shadow-primary/30"></div>
            Current Mission
          </h3>
        </div>
        <div className="relative">
          {renderCurrentMission()}
        </div>
      </div>

      {/* Roadmap Grid */}
      <div className="relative">
        <RoadmapGrid missions={missions} username={username} />
      </div>
    </div>
  );
};

export default RoadmapGridWithMission;