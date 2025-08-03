import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Eye, Share } from 'lucide-react';

const InteractionButton = ({ 
  onClick, 
  active, 
  hoverColor, 
  activeColor, 
  icon: Icon, 
  count, 
  ariaLabel,
  scale = 1.1 
}) => (
  <motion.button 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 group relative ${
      active 
        ? `${activeColor} shadow-sm` 
        : `text-gray-500 hover:${hoverColor}`
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    aria-label={ariaLabel}
  >
    {/* Background highlight on hover */}
    <motion.div
      className={`absolute inset-0 rounded-full ${
        active ? activeColor.replace('text-', 'bg-').replace('-700', '-100/80') : ''
      }`}
      initial={{ scale: 0, opacity: 0 }}
      whileHover={{ 
        scale: active ? 1 : 1.2, 
        opacity: active ? 1 : 0.1,
        backgroundColor: active ? undefined : hoverColor.replace('text-', '').replace('-600', '') === 'amber' ? 'rgb(251 191 36 / 0.1)' : 
                         hoverColor.replace('text-', '').replace('-600', '') === 'blue' ? 'rgb(59 130 246 / 0.1)' :
                         hoverColor.replace('text-', '').replace('-600', '') === 'red' ? 'rgb(239 68 68 / 0.1)' :
                         'rgb(156 163 175 / 0.1)'
      }}
      transition={{ duration: 0.2 }}
    />
    
    {/* Icon with bounce animation */}
    <motion.div
      whileHover={{ scale: scale, rotate: active ? [0, -10, 10, 0] : 0 }}
      transition={{ duration: 0.2 }}
    >
      <Icon size={18} className="relative z-10" />
    </motion.div>
    
    {/* Count with subtle scale */}
    <motion.span 
      className="text-sm font-medium relative z-10 min-w-[1rem] text-center"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {count || 0}
    </motion.span>
  </motion.button>
);

const PostInteractions = ({ 
  post, 
  userInteractions, 
  onInteraction, 
  showComments, 
  toggleComments, 
  comments,
  userProfile 
}) => {
  const handleLikeDislike = async (type, postId, currentState) => {
    const oppositeType = type === 'like' ? 'dislike' : 'like';
    const oppositeState = userInteractions[postId]?.[oppositeType];
    
    // If trying to like/dislike and opposite is active, remove opposite first
    if (!currentState && oppositeState) {
      await onInteraction(oppositeType, postId, true); // Remove opposite
    }
    
    // Then apply the current action
    await onInteraction(type, postId, currentState);
  };

  const handleBookmark = async () => {
    if (!userProfile?.id) {
      console.error('User not authenticated');
      return;
    }
    
    const isCurrentlyBookmarked = userInteractions[post.id]?.bookmark;
    await onInteraction('bookmark', post.id, isCurrentlyBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          text: post.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <motion.div 
      className="px-4 sm:px-6 pb-3 border-t border-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between max-w-lg">
        {/* Like Button */}
        <InteractionButton
          onClick={() => handleLikeDislike('like', post.id, userInteractions[post.id]?.like)}
          active={userInteractions[post.id]?.like}
          hoverColor="text-amber-600"
          activeColor="text-amber-700 bg-amber-100/80"
          icon={ThumbsUp}
          count={post.like_count}
          ariaLabel="Like this post"
          scale={1.2}
        />

        {/* Comment Button */}
        <InteractionButton
          onClick={toggleComments}
          active={showComments}
          hoverColor="text-blue-600"
          activeColor="text-blue-700 bg-blue-100/80"
          icon={MessageCircle}
          count={comments?.length || post.comment_count}
          ariaLabel="View comments"
        />

        {/* Share Button */}
        <InteractionButton
          onClick={handleShare}
          active={false}
          hoverColor="text-green-600"
          activeColor="text-green-700 bg-green-100/80"
          icon={Share}
          count={0}
          ariaLabel="Share this post"
        />

        {/* Dislike Button */}
        <InteractionButton
          onClick={() => handleLikeDislike('dislike', post.id, userInteractions[post.id]?.dislike)}
          active={userInteractions[post.id]?.dislike}
          hoverColor="text-red-600"
          activeColor="text-red-700 bg-red-100/80"
          icon={ThumbsDown}
          count={post.dislike_count}
          ariaLabel="Dislike this post"
        />

        {/* View Count - Static */}
        <motion.div 
          className="flex items-center gap-2 px-3 py-2 text-gray-400"
          whileHover={{ scale: 1.05 }}
        >
          <Eye size={16} />
          <span className="text-sm font-medium">{post.view_count || 0}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PostInteractions;