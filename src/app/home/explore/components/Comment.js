import React, { useState } from 'react';
import { Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const Comment = ({ 
  comment, 
  onReply, 
  level = 0, 
  replies = [],
  onLoadReplies,
  loadingReplies = false 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  const handleReply = async () => {
    if (replyText.trim()) {
      const success = await onReply(comment.id, replyText);
      if (success !== false) {
        setReplyText('');
        setShowReplyForm(false);
        setShowReplies(true);
      }
    }
  };

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      await onLoadReplies(comment.id);
    }
    setShowReplies(!showReplies);
  };

  const maxDepth = 3; // Limit nesting depth
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : '';
  
  return (
    <div className={`${indentClass} ${level > 0 ? 'border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">
                @{comment.profile?.username || 'user'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
            {comment.parent_comment_id && (
              <span className="text-xs text-blue-600">
                Replying to a comment
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-800 text-sm leading-relaxed mb-3">{comment.content}</p>
        
        <div className="flex items-center gap-4">
          {level < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Reply size={12} />
              Reply
            </button>
          )}
          
          {replies.length > 0 && (
            <button
              onClick={toggleReplies}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-3 ml-4">
          <div className="flex gap-2">
            <textarea
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              rows={2}
              placeholder={`Reply to @${comment.profile?.username || 'user'}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={handleReply}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={!replyText.trim()}
              >
                Reply
              </button>
              <button
                onClick={() => setShowReplyForm(false)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              level={level + 1}
              replies={reply.replies || []}
              onLoadReplies={onLoadReplies}
            />
          ))}
        </div>
      )}
      
      {loadingReplies && showReplies && (
        <div className="mt-3 ml-4 text-xs text-gray-500">Loading replies...</div>
      )}
    </div>
  );
};

export default Comment;