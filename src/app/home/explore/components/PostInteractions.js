import React from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Eye } from 'lucide-react';

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

  return (
    <div className="flex items-center justify-between py-4 border-t border-gray-100">
      <div className="flex items-center gap-8">
        <button 
          onClick={() => handleLikeDislike('like', post.id, userInteractions[post.id]?.like)}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
            userInteractions[post.id]?.like ? 'text-gray-600 bg-gray-50' : 'text-gray-600'
          }`}
        >
          <ThumbsUp size={18} className="transition-transform hover:scale-110" />
          <span className="font-semibold text-base">{post.like_count ?? 0}</span>
        </button>

        <button 
          onClick={() => handleLikeDislike('dislike', post.id, userInteractions[post.id]?.dislike)}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
            userInteractions[post.id]?.dislike ? 'text-red-600 bg-red-50' : 'text-gray-600'
          }`}
        >
          <ThumbsDown size={18} className="transition-transform hover:scale-110" />
          <span className="font-semibold text-base">{post.dislike_count || 0}</span>
        </button>

        <button 
          onClick={toggleComments}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
            showComments ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
          }`}
        >
          <MessageCircle size={18} className="transition-transform hover:scale-110" />
          <span className="font-semibold text-base">{comments?.length || post.comment_count || 0}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-gray-500 px-4 py-2">
        <Eye size={18} />
        <span className="font-semibold text-base">{post.view_count || 5}</span>
      </div>
    </div>
  );
};

export default PostInteractions;