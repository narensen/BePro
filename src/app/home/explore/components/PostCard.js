import React, { useState, useEffect } from 'react';
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
    <div className="bg-white/95 border-b border-gray-200/50 hover:bg-white/100 transition-all duration-300 px-6 py-4">
      <div className="max-w-none">
        <PostHeader post={post} />
        <PostContent post={post} searchQuery={searchQuery} /> 
      </div>
      <PostInteractions
        post={post}
        userInteractions={userInteractions}
        onInteraction={onInteraction}
        showComments={showComments}
        toggleComments={toggleComments}
        comments={comments}
        userProfile={userProfile}
      />
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
    </div>
  );
};

export default PostCard;