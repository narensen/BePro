'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase_client';
import SideBar from '../../components/SideBar';
import useUserStore from '../../store/useUserStore';
import LoadingSpinner from '../explore/components/LoadingSpinner';
import SearchBar from '../explore/components/SearchBar';
import PostCard from '../explore/components/PostCard';
import ProfileBar from './components/ProfileBar';
import SortOptions from './components/SortOptions';
import { usePostData } from '../explore/hooks/usePostData';
import { handleViewPost } from '../explore/utils/viewsUtils';
import {
  toggleLike,
  toggleDislike,
  toggleBookmark,
  submitComment,
} from '../../utils/postActions.js';
import { 
  getRecommendedPosts, 
  getRecommendedPostsByCategory,
  calculateUserCringeTolerance 
} from '../explore/utils/recommendationSystem';
import '../explore/styles.css';
import Link from 'next/link';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('recommended');
  const [postInteractions, setPostInteractions] = useState([]);
  const [showProfileBar, setShowProfileBar] = useState(false);
  const router = useRouter();
  const { user } = useUserStore();
  const { loading, posts, setPosts, userInteractions, setUserInteractions, userProfile } = usePostData(user);

  // Fetch user interaction history for better recommendations
  useEffect(() => {
    const fetchInteractionHistory = async () => {
      if (!userProfile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('post_interactions')
          .select(`
            *,
            post:posts(*)
          `)
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setPostInteractions(data || []);
      } catch (error) {
        console.error('Error fetching interaction history:', error);
      }
    };

    fetchInteractionHistory();
  }, [userProfile?.id]);

  // Calculate user's cringe tolerance based on their interaction history
  const userCringeTolerance = useMemo(() => {
    if (!userInteractions || !posts.length) return 0.5;
    return calculateUserCringeTolerance(userInteractions, posts);
  }, [userInteractions, posts]);

  // Get recommended posts based on selected sort mode
  const sortedPosts = useMemo(() => {
    if (!posts.length || !userProfile) return posts;

    const categorizedPosts = getRecommendedPostsByCategory(
      posts,
      userProfile,
      userInteractions,
      postInteractions,
      userCringeTolerance
    );

    switch (sortMode) {
      case 'recommended':
        return getRecommendedPosts(
          posts,
          userProfile,
          userInteractions,
          postInteractions,
          userCringeTolerance
        );
      case 'trending':
        return categorizedPosts.trending;
      case 'recent':
        return categorizedPosts.recent;
      case 'lowCringe':
        return categorizedPosts.lowCringe;
      default:
        return posts;
    }
  }, [posts, userProfile, userInteractions, postInteractions, userCringeTolerance, sortMode]);

  // Filter posts based on search
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return sortedPosts;
    
    return sortedPosts.filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [sortedPosts, searchQuery]);

  const handleInteraction = useCallback(async (type, postId, currentState) => {
    const userId = userProfile?.id;
    if (!userId) return;

    try {
      let success = false;
      if (type === 'like') {
        success = await toggleLike(postId, userId, currentState);
      } else if (type === 'dislike') {
        success = await toggleDislike(postId, userId, currentState);
      } else if (type === 'bookmark') {
        success = await toggleBookmark(postId, userId, currentState);
      }

      if (success !== false) {
        // Update posts
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const updatedPost = { ...post };
              if (type === 'like') {
                updatedPost.like_count = currentState ? Math.max(0, post.like_count - 1) : post.like_count + 1;
              } else if (type === 'dislike') {
                updatedPost.dislike_count = currentState ? Math.max(0, post.dislike_count - 1) : post.dislike_count + 1;
              } else if (type === 'bookmark') {
                updatedPost.bookmark_count = currentState ? Math.max(0, post.bookmark_count - 1) : post.bookmark_count + 1;
              }
              return updatedPost;
            }
            return post;
          })
        );

        // Update user interactions
        setUserInteractions(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            [type]: !currentState
          }
        }));

        // Update interaction history for better future recommendations
        const post = posts.find(p => p.id === postId);
        if (post) {
          setPostInteractions(prev => [{
            id: Date.now().toString(),
            user_id: userId,
            post_id: postId,
            type: type,
            created_at: new Date().toISOString(),
            post: post
          }, ...prev]);
        }
      }
    } catch (error) {
      console.error(`Error handling ${type}:`, error);
    }
  }, [userProfile?.id, setPosts, setUserInteractions, posts]);

  const handleComment = useCallback(async (postId, content) => {
    try {
      const success = await submitComment(postId, userProfile?.id, content);
      if (success !== false) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, comment_count: (post.comment_count || 0) + 1 } : post
          )
        );
        return success;
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  }, [userProfile?.id, setPosts]);

  const handleViewPostCallback = useCallback(async (postId) => {
    try {
      const success = await handleViewPost(postId, userProfile?.id);
      if (success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, view_count: (post.view_count || 0) + 1 } : post
          )
        );
      }
    } catch (error) {
      console.error('Error handling view:', error);
    }
  }, [userProfile?.id, setPosts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400">
        <SideBar />
        <div className="pt-16 lg:pt-0 lg:ml-72">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
      {/* Mobile-First Sidebar */}
      <SideBar />

      {/* Main Content - Mobile First */}
      <div className="transition-all duration-300 ease-in-out min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72 flex flex-col">
        {/* Content Container - Clean and Centered */}
        <div className="flex-1 flex items-center justify-center px-3 lg:px-6 py-4 lg:py-6">
          <div className="w-full max-w-3xl">
            {/* Clean Title Section */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-3">Explore</h1>
              <p className="text-lg text-gray-700 font-medium">Discover posts tailored for you</p>
            </div>
            
            {/* Search and Sort Section */}
            <div className="mb-6 space-y-4">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <SortOptions sortMode={sortMode} setSortMode={setSortMode} />
            </div>

            {/* Posts Section */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {searchQuery ? 'No posts found matching your search' : 'No posts available for this category'}
                  </h3>
                  {sortMode === 'recommended' && (
                    <p className="text-gray-600 text-base mt-2">
                      Interact with more posts to improve your recommendations!
                    </p>
                  )}
                </div>
              ) : (
                filteredPosts.map((post, index) => (
                  <div key={post.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <PostCard
                      post={post}
                      userInteractions={userInteractions}
                      onInteraction={handleInteraction}
                      onComment={handleComment}
                      onViewPost={handleViewPostCallback}
                      userProfile={userProfile}
                      searchQuery={searchQuery}
                      showRecommendationScore={sortMode === 'recommended'}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Profile Bar */}
      <div className="hidden lg:block">
        <ProfileBar currentUser={userProfile} />
      </div>
    </div>
  );
}