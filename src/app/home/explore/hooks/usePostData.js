import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase_client';

export const usePostData = (user) => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [userInteractions, setUserInteractions] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profile')
          .select('*')
          .eq('email', user.email)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Get posts
        const { data: allPosts } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (allPosts) {
          // Get interaction counts
          const postIds = allPosts.map(post => post.id);
          const { data: interactions } = await supabase
            .from('post_interactions')
            .select('post_id, type')
            .in('post_id', postIds);

          // Count interactions
          const interactionCounts = {};
          interactions?.forEach(interaction => {
            if (!interactionCounts[interaction.post_id]) {
              interactionCounts[interaction.post_id] = {
                like_count: 0,
                dislike_count: 0,
                bookmark_count: 0
              };
            }
            interactionCounts[interaction.post_id][`${interaction.type}_count`]++;
          });

          // Get user interactions
          const { data: userInteractionData } = await supabase
            .from('post_interactions')
            .select('post_id, type')
            .eq('user_id', profile?.id);

          const userInteractionMap = {};
          userInteractionData?.forEach(interaction => {
            if (!userInteractionMap[interaction.post_id]) {
              userInteractionMap[interaction.post_id] = {};
            }
            userInteractionMap[interaction.post_id][interaction.type] = true;
          });

          setUserInteractions(userInteractionMap);

          // Get comment counts
          const { data: commentCounts } = await supabase
            .from('comments')
            .select('post_id')
            .in('post_id', postIds);

          const commentCountMap = {};
          commentCounts?.forEach(comment => {
            commentCountMap[comment.post_id] = (commentCountMap[comment.post_id] || 0) + 1;
          });

          // Combine data
          const enrichedPosts = allPosts.map(post => ({
            ...post,
            ...interactionCounts[post.id],
            comment_count: commentCountMap[post.id] || 0
          }));

          setPosts(enrichedPosts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { loading, posts, setPosts, userInteractions, setUserInteractions, userProfile };
};