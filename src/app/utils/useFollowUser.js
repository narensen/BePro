// utils/useFollowUser.js
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase_client';

export const useFollowUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const followUser = useCallback(async (currentUserId, targetUserId) => {
    try {
      setLoading(true);
      setError(null);

      // Add validation
      if (!currentUserId || !targetUserId) {
        const errorMsg = 'User IDs are required';
        console.error(errorMsg, { currentUserId, targetUserId });
        setError(errorMsg);
        return false;
      }

      if (currentUserId === targetUserId) {
        const errorMsg = 'Cannot follow yourself';
        console.error(errorMsg);
        setError(errorMsg);
        return false;
      }

      console.log('Attempting to follow:', { 
        currentUserId: currentUserId, 
        targetUserId: targetUserId,
        currentUserIdType: typeof currentUserId,
        targetUserIdType: typeof targetUserId
      });

      // Verify both users exist before attempting to follow
      console.log('Checking if current user exists in profile table...');
      const { data: currentUser, error: currentUserError } = await supabase
        .from('profile')
        .select('id')
        .eq('id', currentUserId)
        .single();

      console.log('Current user check result:', { currentUser, currentUserError });

      if (currentUserError || !currentUser) {
        console.error('Current user not found in profile table:', {
          error: currentUserError,
          currentUserId: currentUserId,
          errorCode: currentUserError?.code
        });
        
        if (currentUserError?.code === 'PGRST116') {
          setError('User profile not found. Please try logging out and back in.');
        } else {
          setError('User session invalid. Please log in again.');
        }
        return false;
      }

      console.log('Checking if target user exists in profile table...');
      const { data: targetUser, error: targetUserError } = await supabase
        .from('profile')
        .select('id')
        .eq('id', targetUserId)
        .single();

      console.log('Target user check result:', { targetUser, targetUserError });

      if (targetUserError || !targetUser) {
        console.error('Target user not found in profile table:', {
          error: targetUserError,
          targetUserId: targetUserId,
          errorCode: targetUserError?.code
        });
        setError('User not found.');
        return false;
      }

      // Check if already following first to prevent duplicates
      const { data: existingFollow, error: checkError } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();

      // Only ignore "no rows returned" error for the check
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing follow:', checkError);
        setError('Failed to check follow status');
        return false;
      }

      if (existingFollow) {
        console.log('Already following this user');
        return true;
      }

      console.log('Attempting to insert follow relationship...');
      const { data, error } = await supabase
        .from('followers')
        .insert([
          {
            follower_id: currentUserId,
            following_id: targetUserId
          }
        ])
        .select();

      if (error) {
        console.error('Supabase follow error:', error);
        console.error('Insert attempt details:', {
          follower_id: currentUserId,
          following_id: targetUserId,
          errorCode: error.code,
          errorMessage: error.message
        });
        
        // Handle specific error types
        let errorMessage = 'Failed to follow user';
        
        if (error.code === '23503') { // Foreign key constraint violation
          if (error.message.includes('followers_follower_id_fkey')) {
            errorMessage = 'Your user profile is invalid. Please log out and back in.';
          } else if (error.message.includes('followers_following_id_fkey')) {
            errorMessage = 'User not found.';
          } else {
            errorMessage = 'Database constraint error.';
          }
        } else if (error.code === '23505') { // Unique constraint violation
          errorMessage = 'Already following this user.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        return false;
      }

      console.log('Follow successful:', data);
      return true;
    } catch (err) {
      console.error('Unexpected error following user:', err);
      
      const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unfollowUser = useCallback(async (currentUserId, targetUserId) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUserId || !targetUserId) {
        const errorMsg = 'User IDs are required for unfollow';
        console.error(errorMsg, { currentUserId, targetUserId });
        setError(errorMsg);
        return false;
      }

      console.log('Attempting to unfollow:', { currentUserId, targetUserId });

      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (error) {
        console.error('Supabase unfollow error:', error);
        console.error('Error details:', {
          message: error.message || 'Unknown error',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code'
        });
        
        const errorMessage = error.message || error.details || 'Failed to unfollow user';
        setError(errorMessage);
        return false;
      }

      console.log('Unfollow successful');
      return true;
    } catch (err) {
      console.error('Unexpected error unfollowing user:', err);
      console.error('Error type:', typeof err);
      console.error('Error string:', String(err));
      
      const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkFollowStatus = useCallback(async (currentUserId, targetUserId) => {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        throw error;
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