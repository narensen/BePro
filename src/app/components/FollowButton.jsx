import { useState, useEffect } from 'react';
import { useFollowUser } from '../utils/useFollowUser';
import { supabase } from '../lib/supabase_client';
import useUserStore from '../store/useUserStore';

const FollowButton = ({ targetUserId, targetUsername, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { followUser, unfollowUser, loading, error } = useFollowUser();
  const { user, username: currentUsername } = useUserStore();

  // Get current user ID from the store or fetch it
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user ID when component mounts
  useEffect(() => {
    const getCurrentUserId = async () => {
      if (!currentUsername) {
        setCurrentUserId(null);
        return;
      }

      try {
        const { data: currentUser, error } = await supabase
          .from('profile')
          .select('id')
          .eq('username', currentUsername)
          .single();

        if (error) {
          console.error('Error fetching current user ID:', error);
          setCurrentUserId(null);
        } else {
          setCurrentUserId(currentUser.id);
        }
      } catch (err) {
        console.error('Error getting current user ID:', err);
        setCurrentUserId(null);
      }
    };

    getCurrentUserId();
  }, [currentUsername]);

  // Check follow status when we have both user IDs
  useEffect(() => {
    const checkFollowStatus = async () => {
      // Reset state first
      setCheckingStatus(true);
      setIsFollowing(false);

      // Early return conditions
      if (!currentUserId || !targetUserId) {
        setCheckingStatus(false);
        return;
      }

      // If it's the same user, no need to check follow status
      if (currentUserId === targetUserId) {
        setCheckingStatus(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking follow status:', error);
          setIsFollowing(false);
        } else {
          setIsFollowing(!!data);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
        setIsFollowing(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkFollowStatus();
  }, [currentUserId, targetUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId || !targetUserId) {
      console.error('Missing user IDs:', { currentUserId, targetUserId });
      return;
    }

    // Double-check we're not trying to follow ourselves
    if (currentUserId === targetUserId) {
      console.error('Cannot follow yourself');
      return;
    }

    console.log('Follow toggle initiated:', { 
      currentUserId, 
      targetUserId, 
      targetUsername,
      isFollowing 
    });

    let success;
    if (isFollowing) {
      // Use targetUserId or targetUsername for unfollow
      success = await unfollowUser(targetUserId || targetUsername);
    } else {
      // Use targetUserId or targetUsername for follow
      success = await followUser(targetUserId || targetUsername);
    }

    console.log('Operation result:', { success, error });

    if (success) {
      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);
      onFollowChange?.(newFollowState);
    } else {
      console.error('Follow/unfollow operation failed. Error from hook:', error);
    }
  };

  // Early returns for different states
  
  // If we don't have current user info, show login prompt
  if (!currentUsername || !currentUserId) {
    return (
      <div className="text-amber-200/60 text-sm italic">
        Login to follow
      </div>
    );
  }

  // If it's the current user's own profile, show "Your profile"
  if (currentUserId === targetUserId || currentUsername === targetUsername) {
    return (
      <div className="text-amber-200/60 text-sm italic">
        
      </div>
    );
  }

  // If still checking follow status, show loading
  if (checkingStatus) {
    return (
      <div className="w-24 h-10 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-pulse border border-gray-700 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
          isFollowing
            ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-amber-200 hover:from-red-600 hover:to-red-700 hover:text-white border border-gray-600'
            : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-500 hover:to-orange-500 border border-yellow-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        ) : (
          isFollowing ? 'Following' : 'Follow'
        )}
      </button>
      {error && (
        <div className="text-red-400 text-xs mt-1 text-center max-w-32">
          {error}
        </div>
      )}
    </div>
  );
};

export default FollowButton;