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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {posts.map((post, index) => (
        <motion.div 
          key={post.id} 
          className="animate-fadeInUp" 
          style={{ animationDelay: `${index * 0.05}s` }}
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