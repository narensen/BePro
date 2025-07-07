// utils/postActions.js
import { supabase } from '../lib/supabase_client';

export async function toggleLike(postId, userId, currentState) {
  return await toggleInteraction(postId, userId, 'like', currentState);
}

export async function toggleDislike(postId, userId, currentState) {
  return await toggleInteraction(postId, userId, 'dislike', currentState);
}

export async function toggleBookmark(postId, userId, currentState) {
  return await toggleInteraction(postId, userId, 'bookmark', currentState);
}

export async function handleRepost(postId, userId) {
  // Always insert repost (no toggle)
  const { error } = await supabase.from('post_interactions').insert([
    { post_id: postId, user_id: userId, type: 'repost' }
  ]);

  if (error && error.code !== '23505') {
    console.error('Error inserting repost:', error);
    return false;
  }
  return true;
}

export async function incrementViewCount(postId) {
  // Anonymous views allowed, no user_id enforced
  const { error } = await supabase.from('post_views').insert([
    { post_id: postId }
  ]);

  if (error) {
    console.error('Error incrementing view count:', error);
    return false;
  }
  return true;
}

export async function submitComment(postId, userId, content, parentId = null) {
  const { error } = await supabase.from('comments').insert([
    {
      post_id: postId,
      user_id: userId,
      content: content.trim(),
      parent_comment_id: parentId
    }
  ]);

  if (error) {
    console.error('Error inserting comment:', error);
    return false;
  }
  return true;
}

async function toggleInteraction(postId, userId, type, currentState) {
  if (currentState) {
    // Delete the interaction
    const { error } = await supabase
      .from('post_interactions')
      .delete()
      .match({ post_id: postId, user_id: userId, type });

    if (error) {
      console.error(`Error removing ${type}:`, error);
      return false;
    }
  } else {
    
    const { error } = await supabase
      .from('post_interactions')
      .insert([{ post_id: postId, user_id: userId, type }]);

    if (error && error.code !== '23505') {
      console.error(`Error inserting ${type}:`, error);
      return false;
    }
  }
  return true;
}
