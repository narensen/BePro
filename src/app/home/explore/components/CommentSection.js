import React from 'react';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50 hover:border-amber-300/50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquarePlus size={18} className="text-amber-500" />
                    <span className="font-semibold text-gray-700">Join the conversation</span>
                  </div>
                  <textarea
                    className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm resize-none transition-all duration-300 hover:shadow-sm focus:shadow-md bg-white/90 backdrop-blur-sm"
                    rows={3}
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleComment}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-transparent hover:border-amber-300"
                      disabled={!commentText.trim()}
                    >
                      Post Comment
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

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