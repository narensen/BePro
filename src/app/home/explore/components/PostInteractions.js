import React from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Eye, ChevronDown, ChevronUp } from 'lucide-react';

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

  return (
    <div className="px-4 pb-2">
      <div className="flex items-center justify-between max-w-md">
        <button 
          onClick={() => handleLikeDislike('like', post.id, userInteractions[post.id]?.like)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-red-50 group ${
            userInteractions[post.id]?.like 
              ? 'text-red-600' 
              : 'text-gray-500 hover:text-red-600'
          }`}
        >
          <ThumbsUp size={16} className="transition-transform duration-200 group-hover:scale-110" />
          <span className="text-sm font-medium">{post.like_count || 0}</span>
        </button>

        <button 
          onClick={toggleComments}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-blue-50 group ${
            showComments 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          <MessageCircle size={16} className="transition-transform duration-200 group-hover:scale-110" />
          <span className="text-sm font-medium">{comments?.length || post.comment_count || 0}</span>
        </button>

        <button 
          onClick={() => handleLikeDislike('dislike', post.id, userInteractions[post.id]?.dislike)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-gray-50 group ${
            userInteractions[post.id]?.dislike 
              ? 'text-gray-700' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ThumbsDown size={16} className="transition-transform duration-200 group-hover:scale-110" />
          <span className="text-sm font-medium">{post.dislike_count || 0}</span>
        </button>

        <div className="flex items-center gap-1 text-gray-500 px-3 py-1.5">
          <Eye size={16} />
          <span className="text-sm font-medium">{post.view_count || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default PostInteractions;