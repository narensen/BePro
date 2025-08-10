import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Comment from './Comment';

const CommentSection = ({ 
  showComments, 
  comments, 
  loadingComments, 
  commentText, 
  setCommentText, 
  handleComment,
  onReply,
  onLoadReplies
}) => {
  const organizeComments = (comments) => {
    const commentMap = {};
    const topLevelComments = [];
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
    comments.forEach(comment => {
      if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
        commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
      } else {
        topLevelComments.push(commentMap[comment.id]);
      }
    });

    return topLevelComments;
  };

  const organizedComments = organizeComments(comments);

  return (
    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
      showComments ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
    }`}>
      <div className="px-6 py-4 bg-white/95 backdrop-blur-sm border-t border-white/30 space-y-4">
        {/* Comment input */}
        <div className="flex gap-3">
          <textarea
            className="flex-1 border border-gray-200/50 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 hover:shadow-md focus:shadow-lg bg-white/80 backdrop-blur-sm"
            rows={2}
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            onClick={handleComment}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg font-medium"
            disabled={!commentText.trim()}
          >
            Post
          </button>
        </div>

        {}
        {loadingComments ? (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm">Loading comments...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {organizedComments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="transform transition-all duration-300 hover:scale-[1.01]"
                style={{
                  animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
                }}
              >
                <Comment 
                  comment={comment} 
                  onReply={onReply}
                  replies={comment.replies}
                  onLoadReplies={onLoadReplies}
                />
              </div>
            ))}
            {organizedComments.length === 0 && !loadingComments && (
              <p className="text-gray-500 text-sm text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;