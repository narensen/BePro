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
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleLikeDislike('like', post.id, userInteractions[post.id]?.like)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              userInteractions[post.id]?.like 
                ? 'bg-yellow-100 text-yellow-700 shadow-md' 
                : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
            }`}
          >
            <ThumbsUp size={16} className="transition-transform duration-300 hover:scale-110" />
            <span className="font-medium">{post.like_count || 0}</span>
          </button>

          <button 
            onClick={() => handleLikeDislike('dislike', post.id, userInteractions[post.id]?.dislike)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              userInteractions[post.id]?.dislike 
                ? 'bg-red-100 text-red-700 shadow-md' 
                : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
            }`}
          >
            <ThumbsDown size={16} className="transition-transform duration-300 hover:scale-110" />
            <span className="font-medium">{post.dislike_count || 0}</span>
          </button>

          <button 
            onClick={toggleComments}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              showComments 
                ? 'bg-blue-100 text-blue-700 shadow-md' 
                : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
            }`}
          >
            <MessageCircle size={16} className="transition-transform duration-300 hover:scale-110" />
            <span className="font-medium">{comments?.length || post.comment_count || 0}</span>
            <div className="transition-transform duration-300">
              {showComments ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              userInteractions[post.id]?.bookmark 
                ? 'bg-blue-100 text-blue-700 shadow-md' 
                : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
            }`}
          >
            <Bookmark size={16} className={`transition-all duration-300 hover:scale-110 ${
              userInteractions[post.id]?.bookmark ? 'fill-current' : ''
            }`} />
          </button>

          <div className="flex items-center gap-1 text-gray-500 px-3 py-2">
            <Eye size={16} className="transition-transform duration-300 hover:scale-110" />
            <span className="font-medium">{post.view_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostInteractions;