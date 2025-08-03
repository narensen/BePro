'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase_client';
import SideBar from '../../components/SideBar';
import useUserStore from '../../store/useUserStore';

// Components
import ExploreHeader from './components/ExploreHeader';
import SearchAndSort from './components/SearchAndSort';
import PostsList from './components/PostsList';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';
import ProfileBar from './components/ProfileBar';

// Hooks and Utils
import { usePostData } from './hooks/usePostData';
import { handleViewPost } from './utils/viewsUtils';
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
} from './utils/recommendationSystem';

// Mock data for demo
import { mockPosts, mockUserInteractions, mockUserProfile } from './utils/mockData';

import './styles.css';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('recommended');
  const [postInteractions, setPostInteractions] = useState([]);
  const [demoMode, setDemoMode] = useState(false); // Demo mode toggle
  const router = useRouter();
  const { user } = useUserStore();
  const { loading, posts, setPosts, userInteractions, setUserInteractions, userProfile } = usePostData(user);

  // Toggle demo mode with URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      setDemoMode(true);
    }
  }, []);

  // Use mock data when in demo mode
  const currentPosts = demoMode ? mockPosts : posts;
  const currentUserInteractions = demoMode ? mockUserInteractions : userInteractions;
  const currentUserProfile = demoMode ? mockUserProfile : userProfile;
  const isLoading = demoMode ? false : loading;

  // Fetch user interaction history for better recommendations
  useEffect(() => {
    if (demoMode) return; // Skip for demo mode
    
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
  }, [userProfile?.id, demoMode]);

  // Calculate user's cringe tolerance based on their interaction history
  const userCringeTolerance = useMemo(() => {
    if (!currentUserInteractions || !currentPosts.length) return 0.5;
    return calculateUserCringeTolerance(currentUserInteractions, currentPosts);
  }, [currentUserInteractions, currentPosts]);

  // Get recommended posts based on selected sort mode
  const sortedPosts = useMemo(() => {
    if (!currentPosts.length || !currentUserProfile) return currentPosts;

    const categorizedPosts = getRecommendedPostsByCategory(
      currentPosts,
      currentUserProfile,
      currentUserInteractions,
      postInteractions,
      userCringeTolerance
    );

    switch (sortMode) {
      case 'recommended':
        return getRecommendedPosts(
          currentPosts,
          currentUserProfile,
          currentUserInteractions,
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
        return currentPosts;
    }
  }, [currentPosts, currentUserProfile, currentUserInteractions, postInteractions, userCringeTolerance, sortMode]);

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
    if (demoMode) {
      // Demo mode: just update local state
      setUserInteractions(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          [type]: !currentState
        }
      }));
      return true;
    }

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
  }, [userProfile?.id, setPosts, setUserInteractions, posts, demoMode]);

  const handleComment = useCallback(async (postId, content) => {
    if (demoMode) {
      // Demo mode: just return success
      return true;
    }

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
  }, [userProfile?.id, setPosts, demoMode]);

  const handleViewPostCallback = useCallback(async (postId) => {
    if (demoMode) return true; // Demo mode: no-op

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
  }, [userProfile?.id, setPosts, demoMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400">
        <SideBar />
        <div className="pt-16 lg:pt-0 lg:ml-72">
          <div className="max-w-2xl mx-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 p-4 z-10 shadow-xl rounded-t-2xl">
              <h1 className="text-xl font-black text-gray-900">Explore</h1>
            </div>
            <LoadingSpinner showSkeleton={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
      <SideBar />

      <div className="min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72 xl:mr-80">
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 p-4 z-10 shadow-xl rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-gray-900">Explore</h1>
              {/* Demo mode toggle */}
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  demoMode 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {demoMode ? '🎭 Demo Mode' : 'Enable Demo'}
              </button>
            </div>
          </div>
            
          <SearchAndSort 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortMode={sortMode}
            setSortMode={setSortMode}
          />

          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">
                {searchQuery ? 'No posts found matching your search' : 'No posts available'}
              </div>
            </div>
          ) : (
            <PostsList
              posts={filteredPosts}
              userInteractions={currentUserInteractions}
              onInteraction={handleInteraction}
              onComment={handleComment}
              onViewPost={handleViewPostCallback}
              userProfile={currentUserProfile}
              searchQuery={searchQuery}
              sortMode={sortMode}
            />
          )}
        </div>
      </div>

      <div className="hidden xl:block">
        <ProfileBar currentUser={currentUserProfile} />
      </div>
    </div>
  );
}