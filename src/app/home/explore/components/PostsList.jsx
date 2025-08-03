'use client'

import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './PostCard';

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      duration: 0.4
    }
  }
};

export default function PostsList({ 
  posts, 
  userInteractions, 
  onInteraction, 
  onComment, 
  onViewPost, 
  userProfile, 
  searchQuery, 
  sortMode 
}) {
  return (
    <motion.div 
      className="space-y-4 py-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      layout
    >
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div 
            key={post.id} 
            variants={itemVariants}
            layout
            initial="hidden"
            animate="show"
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
              transition: { duration: 0.2 }
            }}
            whileInView={{ 
              opacity: 1,
              transition: { delay: index * 0.05 }
            }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <PostCard
              post={post}
              userInteractions={userInteractions}
              onInteraction={onInteraction}
              onComment={onComment}
              onViewPost={onViewPost}
              userProfile={userProfile}
              searchQuery={searchQuery}
              showRecommendationScore={sortMode === 'recommended'}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}