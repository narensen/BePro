import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase_client';
import useUserStore from '../store/useUserStore';

export const useFollowUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, username } = useUserStore();
  const getUserId = useCallback(async (identifier) => {
    if (!identifier) return null;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    if (isUUID) {

      const { data, error } = await supabase
        .from('profile')
        .select('id')
        .eq('id', identifier)
        .single();
      
      if (error || !data) {
        console.error('User ID not found in profile table:', identifier);
        return null;
      }
      return identifier;
    } else {

      const { data, error } = await supabase
        .from('profile')
        .select('id')
        .eq('username', identifier)
        .single();
      
      if (error || !data) {
        console.error('Username not found in profile table:', identifier);
        return null;
      }
      return data.id;
    }
  }, []);
  const getCurrentUserId = useCallback(async () => {
    if (!username) return null;

    const { data, error } = await supabase
      .from('profile')
      .select('id')
      .eq('username', username)
      .single();

    if (error || !data) {
      console.error('Current user not found:', error);
      return null;
    }
    return data.id;
  }, [username]);

  const followUser = useCallback(async (targetUserIdentifier) => {
    try {
      setLoading(true);
      setError(null);

      if (!targetUserIdentifier) {
        setError('Target user identifier is required');
        return false;
      }

      if (!username) {
        setError('You must be logged in to follow users');
        return false;
      }
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        setError('Current user not found. Please log in again.');
        return false;
      }
      const targetUserId = await getUserId(targetUserIdentifier);
      if (!targetUserId) {
        setError('User not found');
        return false;
      }
      if (currentUserId === targetUserId) {
        setError('Cannot follow yourself');
        return false;
      }
      const { data: existingFollow, error: checkError } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing follow:', checkError);
        setError('Failed to check follow status');
        return false;
      }

      if (existingFollow) {

        return true;
      }
      const { error: insertError } = await supabase
        .from('followers')
        .insert([{
          follower_id: currentUserId,
          following_id: targetUserId
        }]);

      if (insertError) {
        console.error('Error creating follow relationship:', insertError);
        if (insertError.code === '23505') {

          return true;
        } else if (insertError.code === '23503') {

          if (insertError.message.includes('followers_follower_id_fkey')) {
            setError('Your profile is invalid. Please log out and back in.');
          } else {
            setError('User not found.');
          }
        } else {
          setError(insertError.message || 'Failed to follow user');
        }
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected error following user:', err);
      setError(err?.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [username, getCurrentUserId, getUserId]);

  const unfollowUser = useCallback(async (targetUserIdentifier) => {
    try {
      setLoading(true);
      setError(null);

      if (!targetUserIdentifier) {
        setError('Target user identifier is required');
        return false;
      }

      if (!username) {
        setError('You must be logged in to unfollow users');
        return false;
      }
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        setError('Current user not found. Please log in again.');
        return false;
      }
      const targetUserId = await getUserId(targetUserIdentifier);
      if (!targetUserId) {
        setError('User not found');
        return false;
      }
      const { error: deleteError } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (deleteError) {
        console.error('Error deleting follow relationship:', deleteError);
        setError(deleteError.message || 'Failed to unfollow user');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected error unfollowing user:', err);
      setError(err?.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [username, getCurrentUserId, getUserId]);

  const checkFollowStatus = useCallback(async (currentUserId, targetUserId) => {
    try {
      if (!currentUserId || !targetUserId) {
        return false;
      }

      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  }, []);

  return {
    followUser,
    unfollowUser,
    checkFollowStatus,
    loading,
    error
  };
};