'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Objective from './Objective';

const MissionSidebar = ({
  missionTitle,
  objectives,
  onToggleObjective,
  onCompleteMission,
}) => {
  const completedCount = objectives.filter((obj) => obj.completed).length;
  const progress =
    objectives.length > 0 ? (completedCount / objectives.length) * 100 : 0;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="w-full md:w-1/3 bg-gray-900 text-white p-6 flex flex-col h-full"
    >
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
          {missionTitle}
        </h2>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Objectives</h3>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
            <motion.div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <ul className="space-y-3">
            {objectives.map((objective) => (
              <Objective
                key={objective.text}
                objective={objective}
                onToggle={onToggleObjective}
              />
            ))}
          </ul>
        </div>
      </div>
      <button
        onClick={onCompleteMission}
        disabled={progress < 100}
        className="w-full bg-yellow-400 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        Complete Mission
        <ArrowRight className="ml-2" />
      </button>
    </motion.div>
  );
};

export default MissionSidebar;
