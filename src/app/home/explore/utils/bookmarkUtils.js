import { supabase } from '../../../lib/supabase_client';

export const toggleBookmark = async (postId, userId) => {
  if (!postId || !userId) {
    console.error('Missing postId or userId');
    return false;
  }

  try {
    // Check if post is already bookmarked
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId) // postId should be UUID string
      .maybeSingle();

    if (checkError) {
      console.error('Error checking bookmark:', checkError);
      return false;
    }

    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);

      if (deleteError) {
        console.error('Error removing bookmark:', deleteError);
        return false;
      }

      console.log('Bookmark removed');
      return { action: 'removed', bookmarked: false };
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert([{
          user_id: userId,
          post_id: postId // postId as UUID string
        }]);

      if (insertError) {
        console.error('Error adding bookmark:', insertError);
        return false;
      }

      console.log('Bookmark added');
      return { action: 'added', bookmarked: true };
    }
  } catch (error) {
    console.error('Error in toggleBookmark:', error);
    return false;
  }
};

export const isPostBookmarked = async (postId, userId) => {
  if (!postId || !userId) return false;

  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId) // postId as UUID string
      .maybeSingle();

    if (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isPostBookmarked:', error);
    return false;
  }
};