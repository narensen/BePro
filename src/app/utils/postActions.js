import { supabase } from '../lib/supabase_client';

export const toggleLike = async (postId, userId, currentState) => {
  if (!postId || !userId) return false;

  try {
    if (currentState) {

      const { error } = await supabase
        .from('post_interactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('type', 'like');

      return !error;
    } else {

      await supabase
        .from('post_interactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('type', 'dislike');
      const { error } = await supabase
        .from('post_interactions')
        .insert([{
          post_id: postId,
          user_id: userId,
          type: 'like'
        }]);

      return !error;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
  }
};

export const toggleDislike = async (postId, userId, currentState) => {
  if (!postId || !userId) return false;

  try {
    if (currentState) {

      const { error } = await supabase
        .from('post_interactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('type', 'dislike');

      return !error;
    } else {

      await supabase
        .from('post_interactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('type', 'like');
      const { error } = await supabase
        .from('post_interactions')
        .insert([{
          post_id: postId,
          user_id: userId,
          type: 'dislike'
        }]);

      return !error;
    }
  } catch (error) {
    console.error('Error toggling dislike:', error);
    return false;
  }
};

export const toggleBookmark = async (postId, userId, currentState) => {
  if (!postId || !userId) return false;

  try {
    if (currentState) {

      const { error } = await supabase
        .from('post_interactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('type', 'bookmark');

      return !error;
    } else {

      const { error } = await supabase
        .from('post_interactions')
        .insert([{
          post_id: postId,
          user_id: userId,
          type: 'bookmark'
        }]);

      return !error;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return false;
  }
};

export const submitComment = async (postId, userId, content, parentCommentId = null) => {
  if (!postId || !userId || !content?.trim()) return false;

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        parent_comment_id: parentCommentId,
        created_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    return error ? false : data;
  } catch (error) {
    console.error('Error submitting comment:', error);
    return false;
  }
};

export const submitReply = async (postId, userId, content, parentCommentId) => {
  return await submitComment(postId, userId, content, parentCommentId);
};

export const incrementViewCount = async (postId) => {
  if (!postId) return false;

  try {
    const { error } = await supabase
      .from('posts')
      .update({ 
        view_count: supabase.raw('view_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    return !error;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return false;
  }
};

export const handleViewPost = async (postId, userId) => {
  if (!postId || !userId) return false;

  try {

    const { data: existingView, error: checkError } = await supabase
      .from('post_views')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing view:', checkError);
      return false;
    }
    if (!existingView) {
      const { error: insertError } = await supabase
        .from('post_views')
        .insert([{
          post_id: postId,
          user_id: userId,
          viewed_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error inserting view:', insertError);
        return false;
      }
      const { error: updateError } = await supabase
        .from('posts')
        .update({ 
          view_count: supabase.raw('view_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating view count:', updateError);
        return false;
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error handling view:', error);
    return false;
  }
};

export const deletePost = async (postId, userId) => {
  if (!postId || !userId) return false;

  try {

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Error fetching post:', postError);
      return false;
    }

    if (post.user_id !== userId) {
      console.error('User does not own this post');
      return false;
    }
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

export const editPost = async (postId, userId, content, tags = []) => {
  if (!postId || !userId || !content?.trim()) return false;

  try {

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Error fetching post:', postError);
      return false;
    }

    if (post.user_id !== userId) {
      console.error('User does not own this post');
      return false;
    }
    const { data, error } = await supabase
      .from('posts')
      .update({
        content: content.trim(),
        tags: tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .eq('user_id', userId)
      .select('*')
      .single();

    return error ? false : data;
  } catch (error) {
    console.error('Error editing post:', error);
    return false;
  }
};

export const createPost = async (userId, content, tags = []) => {
  if (!userId || !content?.trim()) return false;

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: userId,
        content: content.trim(),
        tags: tags,
        like_count: 0,
        dislike_count: 0,
        comment_count: 0,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    return error ? false : data;
  } catch (error) {
    console.error('Error creating post:', error);
    return false;
  }
};

export const getPostInteractionCounts = async (postId) => {
  if (!postId) return null;

  try {
    const { data, error } = await supabase
      .from('post_interactions')
      .select('type')
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching interaction counts:', error);
      return null;
    }

    const counts = {
      like_count: 0,
      dislike_count: 0,
      bookmark_count: 0
    };

    data?.forEach(interaction => {
      counts[`${interaction.type}_count`]++;
    });

    return counts;
  } catch (error) {
    console.error('Error getting interaction counts:', error);
    return null;
  }
};

export const getUserInteractions = async (userId, postIds = []) => {
  if (!userId || postIds.length === 0) return {};

  try {
    const { data, error } = await supabase
      .from('post_interactions')
      .select('post_id, type')
      .eq('user_id', userId)
      .in('post_id', postIds);

    if (error) {
      console.error('Error fetching user interactions:', error);
      return {};
    }

    const interactions = {};
    data?.forEach(interaction => {
      if (!interactions[interaction.post_id]) {
        interactions[interaction.post_id] = {};
      }
      interactions[interaction.post_id][interaction.type] = true;
    });

    return interactions;
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return {};
  }
};

export const deleteComment = async (commentId, userId) => {
  if (!commentId || !userId) return false;

  try {

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      console.error('Error fetching comment:', commentError);
      return false;
    }

    if (comment.user_id !== userId) {
      console.error('User does not own this comment');
      return false;
    }
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

export const editComment = async (commentId, userId, content) => {
  if (!commentId || !userId || !content?.trim()) return false;

  try {

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      console.error('Error fetching comment:', commentError);
      return false;
    }

    if (comment.user_id !== userId) {
      console.error('User does not own this comment');
      return false;
    }
    const { data, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', userId)
      .select('*')
      .single();

    return error ? false : data;
  } catch (error) {
    console.error('Error editing comment:', error);
    return false;
  }
};

export const getCommentReplies = async (commentId) => {
  if (!commentId) return [];

  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:user_id(username, email)
      `)
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true });

    return error ? [] : data || [];
  } catch (error) {
    console.error('Error fetching comment replies:', error);
    return [];
  }
};

export const reportPost = async (postId, userId, reason) => {
  if (!postId || !userId || !reason?.trim()) return false;

  try {
    const { error } = await supabase
      .from('post_reports')
      .insert([{
        post_id: postId,
        reported_by: userId,
        reason: reason.trim(),
        created_at: new Date().toISOString()
      }]);

    return !error;
  } catch (error) {
    console.error('Error reporting post:', error);
    return false;
  }
};

export const reportComment = async (commentId, userId, reason) => {
  if (!commentId || !userId || !reason?.trim()) return false;

  try {
    const { error } = await supabase
      .from('comment_reports')
      .insert([{
        comment_id: commentId,
        reported_by: userId,
        reason: reason.trim(),
        created_at: new Date().toISOString()
      }]);

    return !error;
  } catch (error) {
    console.error('Error reporting comment:', error);
    return false;
  }
};

export const followUser = async (followerId, followingId) => {
  if (!followerId || !followingId || followerId === followingId) return false;

  try {
    const { error } = await supabase
      .from('user_follows')
      .insert([{
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      }]);

    return !error;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

export const unfollowUser = async (followerId, followingId) => {
  if (!followerId || !followingId) return false;

  try {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    return !error;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};