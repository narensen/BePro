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
      className="relative group mb-6"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -1,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      layout
    >
      {/* Clean minimal post design - no heavy cards */}
      <div className="relative bg-white/70 backdrop-blur-sm transition-all duration-300 ease-out hover:bg-white/80 rounded-xl p-6">
        
        {/* Main content area with improved spacing */}
        <div className="relative">
          <PostHeader post={post} />
          <PostContent post={post} searchQuery={searchQuery} /> 
        </div>

        {/* Clean interactions with better spacing */}
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
      </div>
    </motion.article>
  );
};

export default PostCard;