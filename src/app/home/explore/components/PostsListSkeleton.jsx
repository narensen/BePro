import React from 'react';
import { motion } from 'framer-motion';

const PostCardSkeleton = () => {
  return (
    <motion.div
      className="relative border-b border-gray-100/50 bg-white/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="px-4 sm:px-6 py-4">
        {/* Header Skeleton */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar Skeleton */}
          <motion.div 
            className="w-11 h-11 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex-shrink-0"
            animate={{ 
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* User Info Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <motion.div 
                className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"
                animate={{ 
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.1
                }}
              />
              <motion.div 
                className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"
                animate={{ 
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-3 mb-4">
          <motion.div 
            className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"
            animate={{ 
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.3
            }}
          />
          <motion.div 
            className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"
            animate={{ 
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.4
            }}
          />
          <motion.div 
            className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"
            animate={{ 
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>

        {/* Tags Skeleton */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              className="h-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full w-16"
              animate={{ 
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.6 + i * 0.1
              }}
            />
          ))}
        </div>
      </div>

      {/* Interactions Skeleton */}
      <div className="px-4 sm:px-6 pb-3 border-t border-gray-50">
        <div className="flex items-center justify-between max-w-lg pt-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div 
              key={i}
              className="flex items-center gap-2"
              animate={{ 
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.8 + i * 0.05
              }}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              <div className="w-6 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const PostsListSkeleton = ({ count = 3 }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden shadow-xl">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <PostCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
};

export { PostCardSkeleton, PostsListSkeleton };
export default PostsListSkeleton;