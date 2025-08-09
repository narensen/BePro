import React from 'react';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Comment from './Comment';
import CommentInput from '../../../../components/CommentInput';

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

  const handleCommentWithImages = (text, images) => {
    handleComment(text, images);
  };

  const organizedComments = organizeComments(comments);

  return (
    <AnimatePresence>
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-br from-white/90 via-amber-50/30 to-yellow-50/40 backdrop-blur-sm rounded-xl border border-amber-100/50 p-6 space-y-6">
            {/* Comment Input */}
            <CommentInput
              commentText={commentText}
              setCommentText={setCommentText}
              onSubmit={handleCommentWithImages}
              placeholder="Share your thoughts..."
              buttonText="Post Comment"
            />

            {/* Comments */}
            {loadingComments ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-8"
              >
                <div className="flex items-center gap-3 text-amber-600 bg-white/60 px-6 py-3 rounded-xl border border-amber-200/50">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="font-semibold">Loading conversations...</span>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {organizedComments.map((comment, index) => (
                    <motion.div 
                      key={comment.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <Comment 
                        comment={comment} 
                        onReply={onReply}
                        replies={comment.replies}
                        onLoadReplies={onLoadReplies}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {organizedComments.length === 0 && !loadingComments && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-6 border border-amber-200/50">
                      <MessageSquarePlus size={32} className="text-amber-500 mx-auto mb-3" />
                      <p className="text-gray-600 font-semibold">No comments yet.</p>
                      <p className="text-gray-500 text-sm mt-1">Be the first to start the conversation!</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentSection;