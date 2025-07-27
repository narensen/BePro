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
    <div className="space-y-6 lg:space-y-8">
      {posts.map((post, index) => (
        <motion.div 
          key={post.id} 
          className="animate-fadeInUp lg:max-w-3xl lg:mx-auto" 
          style={{ animationDelay: `${index * 0.1}s` }}
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