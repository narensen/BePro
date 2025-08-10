import React from 'react';
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
      <div className="px-6 py-6 bg-gray-50 border-t border-gray-200 space-y-6">
        <div className="flex gap-4">
          <textarea
            className="flex-1 border border-gray-300 rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 hover:shadow-sm focus:shadow-md bg-white"
            rows={3}
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            onClick={handleComment}
            className="bg-yellow-500 text-white px-6 py-3 rounded-xl hover:bg-yellow-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium self-start"
            disabled={!commentText.trim()}
          >
            Post
          </button>
        </div>

        {loadingComments ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm font-medium">Loading comments...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {organizedComments.map((comment, index) => (
              <div key={comment.id}>
                <Comment 
                  comment={comment} 
                  onReply={onReply}
                  replies={comment.replies}
                  onLoadReplies={onLoadReplies}
                />
              </div>
            ))}
            {organizedComments.length === 0 && !loadingComments && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm font-medium">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;