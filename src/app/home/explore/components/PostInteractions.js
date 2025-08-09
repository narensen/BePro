import React from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Eye, ChevronDown } from 'lucide-react';

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
    if (!currentState && oppositeState) {
      await onInteraction(oppositeType, postId, true);
    }
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
    <div className="border-t border-gray-100 pt-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleLikeDislike('like', post.id, userInteractions[post.id]?.like)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              userInteractions[post.id]?.like 
                ? 'bg-amber-100 text-amber-700' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <ThumbsUp size={16} />
            <span className="text-sm font-medium">{post.like_count || 0}</span>
          </button>

          <button 
            onClick={() => handleLikeDislike('dislike', post.id, userInteractions[post.id]?.dislike)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              userInteractions[post.id]?.dislike 
                ? 'bg-red-100 text-red-700' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <ThumbsDown size={16} />
            <span className="text-sm font-medium">{post.dislike_count || 0}</span>
          </button>

          <button 
            onClick={toggleComments}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              showComments 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <MessageCircle size={16} />
            <span className="text-sm font-medium">{comments?.length || post.comment_count || 0}</span>
            <ChevronDown 
              size={14} 
              className={`transform transition-transform duration-200 ${showComments ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <Eye size={16} />
          <span>{post.view_count || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default PostInteractions;