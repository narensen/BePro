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
    <div className="max-w-4xl mx-auto mobile:px-0 px-4 py-6">
      <div className="mobile-content-spacing mobile:space-y-4 space-y-8">
        {posts.map((post, index) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: Math.min(index * 0.05, 0.5), // Cap delay for better performance
              ease: "easeOut"
            }}
            className="mobile-post-card"
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
    </div>
  );
}