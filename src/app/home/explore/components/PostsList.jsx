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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-8">
        {posts.map((post, index) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
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