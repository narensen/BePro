'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Objective = ({ objective, onToggle }) => {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start p-3 rounded-lg transition-colors ${
        objective.completed ? 'bg-green-600/20 text-gray-400' : 'bg-gray-800/50'
      }`}
      onClick={() => onToggle(objective.text)}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0 cursor-pointer border-2 ${
          objective.completed
            ? 'bg-green-500 border-green-400'
            : 'border-gray-500'
        }`}
      >
        {objective.completed && <Check className="w-4 h-4 text-white" />}
      </div>
      <span
        className={`flex-1 ${
          objective.completed ? 'line-through' : ''
        }`}
      >
        {objective.text}
      </span>
    </motion.li>
  );
};

export default Objective;
