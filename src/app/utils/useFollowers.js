import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase_client';

export const useFollowers = (userId) => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFollowData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data: followersData, error: followersError } = await supabase
        .from('followers')
        .select(`
          id,
          created_at,
          follower_id,
          profile:follower_id (
            id,
            username,
            avatar_url,
            email
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (followersError) throw followersError;
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select(`
          id,
          created_at,
          following_id,
          profile:following_id (
            id,
            username,
            avatar_url,
            email
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (followingError) throw followingError;

      setFollowers(followersData || []);
      setFollowing(followingData || []);
      setFollowerCount(followersData?.length || 0);
      setFollowingCount(followingData?.length || 0);
      
    } catch (err) {
      console.error('Error fetching follow data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowData();
  }, [userId]);

  const refetch = () => fetchFollowData();

  return {
    followers,
    following,
    followerCount,
    followingCount,
    loading,
    error,
    refetch
  };
};
