import React from 'react';
import { motion } from 'framer-motion';
import PostsListSkeleton from './PostsListSkeleton';

const LoadingSpinner = ({ showSkeleton = true }) => {
  if (showSkeleton) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PostsListSkeleton count={3} />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.div 
          className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Additional loading elements */}
        <motion.div
          className="absolute inset-0 w-8 h-8 border-2 border-transparent border-r-orange-500/40 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <motion.p 
        className="text-gray-900 mt-4 font-bold"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading posts...
      </motion.p>
    </motion.div>
  );
};

export default LoadingSpinner;