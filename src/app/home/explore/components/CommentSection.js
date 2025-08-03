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

    // First pass: create comment map
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: organize into hierarchy
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
      <div className="px-4 py-3 bg-amber-50/50 backdrop-blur-sm border-t border-amber-200/50 space-y-3">
        {/* Add Comment */}
        <div className="flex gap-2">
          <textarea
            className="flex-1 border border-amber-300/50 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white/90 backdrop-blur-sm"
            rows={2}
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            onClick={handleComment}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-3 py-2 rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-md hover:scale-105"
            disabled={!commentText.trim()}
          >
            Post
          </button>
        </div>

        {/* Comments List */}
        {loadingComments ? (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm">Loading comments...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {organizedComments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="transition-all duration-200"
                style={{
                  animation: `slideInUp 0.2s ease-out ${index * 0.05}s both`
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
              <p className="text-gray-500 text-sm text-center py-3">
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