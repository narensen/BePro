import { supabase } from '../../../lib/supabase_client';

export const handleViewPost = async (postId, userId) => {
  if (!postId || !userId) {
    console.error('Missing postId or userId');
    return false;
  }

  try {

    const viewedPostsKey = `viewed_posts_${userId}`;
    const viewedPosts = JSON.parse(localStorage.getItem(viewedPostsKey) || '[]');
    
    if (viewedPosts.includes(postId.toString())) {
      console.log('User has already viewed this post');
      return false;
    }

    console.log('Recording new view for post:', postId);
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Error fetching post:', fetchError);
      return false;
    }
    const newViewCount = (post?.view_count || 0) + 1;
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({ view_count: newViewCount })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating view count:', updateError);
      return false;
    }
    viewedPosts.push(postId.toString());
    localStorage.setItem(viewedPostsKey, JSON.stringify(viewedPosts));

    console.log('Successfully incremented view count to:', newViewCount);
    return true;
  } catch (error) {
    console.error('Error in handleViewPost:', error);
    return false;
  }
};