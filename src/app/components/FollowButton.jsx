// components/FollowButton.js
import { useState, useEffect } from 'react';
import { useFollowUser } from '../utils/useFollowUser';
import { supabase } from '../lib/supabase_client';

const FollowButton = ({ currentUserId, targetUserId, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { followUser, unfollowUser, loading, error } = useFollowUser();

  // Check follow status on component mount and when user IDs change
  useEffect(() => {
    const checkStatus = async () => {
      if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
        setCheckingStatus(false);
        return;
      }

      try {
        setCheckingStatus(true);
        
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

    checkStatus();
  }, [currentUserId, targetUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId || !targetUserId) {
      console.error('Missing user IDs:', { currentUserId, targetUserId });
      return;
    }

    console.log('Follow toggle initiated:', { currentUserId, targetUserId, isFollowing });

    let success;
    if (isFollowing) {
      success = await unfollowUser(currentUserId, targetUserId);
    } else {
      success = await followUser(currentUserId, targetUserId);
    }

    console.log('Operation result:', { success, error });

    if (success) {
      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);
      onFollowChange?.(newFollowState);
    } else {
      console.error('Follow/unfollow operation failed. Error from hook:', error);
      // You might want to show a toast notification here
    }
  };

  // Early returns for different states
  if (currentUserId === targetUserId) {
    return (
      <div className="text-amber-200/60 text-sm italic">
        Your profile
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="text-amber-200/60 text-sm italic">
        Login to follow
      </div>
    );
  }

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