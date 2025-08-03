import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase_client';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostInteractions from './PostInteractions';
import CommentSection from './CommentSection';
import { submitReply } from '../../../utils/postActions';

const PostCard = ({
  post,
  searchQuery,
  userInteractions,
  onInteraction,
  onComment,
  onViewPost,
  userProfile,
  showRecommendationScore
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasViewedOnce, setHasViewedOnce] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!hasViewedOnce && userProfile?.id && post?.id) {
      onViewPost(post.id);
      setHasViewedOnce(true);
    }
  }, [userProfile?.id, post?.id, onViewPost, hasViewedOnce]);

  const fetchComments = async () => {
    if (comments.length > 0) return;

    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`*, profile:user_id(username, email)`)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (!error && data) setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = async () => {
    const newShowState = !showComments;
    setShowComments(newShowState);

    if (newShowState && comments.length === 0) {
      await fetchComments();
    }
  };

  const handleComment = async () => {
    if (commentText.trim()) {
      const success = await onComment(post.id, commentText);
      if (success !== false) {
        setCommentText('');
        setTimeout(() => fetchComments(), 500);
      }
    }
  };

  const handleReply = async (parentCommentId, content) => {
    try {
      const success = await submitReply(post.id, userProfile?.id, content, parentCommentId);
      if (success !== false) {
        setTimeout(() => fetchComments(), 500);
        return success;
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
    return false;
  };

  const handleLoadReplies = async (commentId) => true;

  return (
    <motion.article
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      layout
    >
      {/* X.com-style card with subtle border and hover effects */}
      <div className="relative border-b border-gray-100/50 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-out cursor-pointer hover:bg-white hover:shadow-lg hover:shadow-gray-200/25 group-hover:border-gray-200/75">
        
        {/* Subtle left accent border on hover */}
        <motion.div 
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Main content area with improved padding */}
        <div className="px-4 sm:px-6 py-4 relative">
          <PostHeader post={post} />
          <PostContent post={post} searchQuery={searchQuery} /> 
        </div>

        {/* Enhanced interactions with better spacing */}
        <PostInteractions
          post={post}
          userInteractions={userInteractions}
          onInteraction={onInteraction}
          showComments={showComments}
          toggleComments={toggleComments}
          comments={comments}
          userProfile={userProfile}
        />

        {/* Animated comment section */}
        <motion.div
          initial={false}
          animate={{ 
            height: showComments ? "auto" : 0,
            opacity: showComments ? 1 : 0 
          }}
          transition={{ 
            duration: 0.3, 
            ease: "easeInOut",
            opacity: { delay: showComments ? 0.1 : 0 }
          }}
          style={{ overflow: "hidden" }}
        >
          <CommentSection
            showComments={showComments}
            comments={comments}
            loadingComments={loadingComments}
            commentText={commentText}
            setCommentText={setCommentText}
            handleComment={handleComment}
            onReply={handleReply}
            onLoadReplies={handleLoadReplies}
          />
        </motion.div>

        {/* Subtle glow effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-transparent to-orange-400/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 rounded-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.article>
  );
};

export default PostCard;