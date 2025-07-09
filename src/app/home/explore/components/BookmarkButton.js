'use client'

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase_client';

const BookmarkButton = ({ postId, userId, className = "" }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!postId || !userId) return;
      
      try {
        console.log('Checking bookmark status for post:', postId, 'user:', userId);
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', userId)
          .eq('post_id', postId)
          .maybeSingle();

        console.log('Bookmark check result:', { data, error });

        if (!error && data) {
          setIsBookmarked(true);
          console.log('Post is bookmarked');
        } else {
          setIsBookmarked(false);
          console.log('Post is not bookmarked');
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    
    checkBookmarkStatus();
  }, [postId, userId]);

  const handleToggleBookmark = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (loading || !postId || !userId) {
      console.log('Cannot toggle bookmark:', { loading, postId, userId });
      return;
    }
    
    setLoading(true);
    console.log('Toggling bookmark for post:', postId, 'user:', userId, 'current state:', isBookmarked);
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        console.log('Removing bookmark...');
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (error) {
          console.error('Error removing bookmark:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
          setIsBookmarked(false);
          console.log('Bookmark removed successfully');
        }
      } else {
        // Add bookmark
        console.log('Adding bookmark...');
        const { data, error } = await supabase
          .from('bookmarks')
          .insert([{
            user_id: userId,
            post_id: postId
          }])
          .select();

        console.log('Insert result:', { data, error });

        if (error) {
          console.error('Error adding bookmark:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
        } else {
          setIsBookmarked(true);
          console.log('Bookmark added successfully', data);
        }
      }
    } catch (error) {
      console.error('Caught error in handleToggleBookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 ${
        isBookmarked 
          ? 'bg-blue-500 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${className}`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg 
          className="w-5 h-5" 
          fill={isBookmarked ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      )}
    </button>
  );
};

export default BookmarkButton;