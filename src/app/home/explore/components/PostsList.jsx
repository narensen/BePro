'use client'

import { motion } from 'framer-motion';
import PostCard from './PostCard';

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
    <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden shadow-xl">
      {posts.map((post, index) => (
        <motion.div 
          key={post.id} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
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
    </div>
  );
}