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



import './styles.css';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('recommended');
  const [postInteractions, setPostInteractions] = useState([]);
  const router = useRouter();
  const { user } = useUserStore();
  const { loading, posts, setPosts, userInteractions, setUserInteractions, userProfile } = usePostData(user);

  // Temporary mock data for testing the new design
  const mockPosts = [
    {
      id: 1,
      content: "Just completed my first full-stack project using Next.js and Supabase! 🚀 The learning curve was steep but totally worth it. Building real-time features with PostgreSQL was amazing.",
      username: "alexdev",
      email: "alex@example.com",
      created_at: "2024-01-15T10:30:00Z",
      like_count: 24,
      dislike_count: 2,
      comment_count: 8,
      view_count: 156,
      bookmark_count: 12,
      tags: ["nextjs", "supabase", "fullstack", "postgresql"],
      user_role: "Developer"
    },
    {
      id: 2,
      content: "Hot take: TypeScript isn't just about catching bugs - it's about making your code self-documenting and improving developer experience. Once you go TypeScript, you never go back! 💙",
      username: "sarah_codes",
      email: "sarah@example.com", 
      created_at: "2024-01-15T08:15:00Z",
      like_count: 67,
      dislike_count: 5,
      comment_count: 23,
      view_count: 342,
      bookmark_count: 31,
      tags: ["typescript", "dx", "webdev"],
      user_role: "Senior Engineer"
    },
    {
      id: 3,
      content: "Successfully deployed my React Native app to both iOS and Android stores! 📱✨ The cross-platform development experience was smoother than expected. Expo made everything so much easier.",
      username: "mobile_mike",
      email: "mike@example.com",
      created_at: "2024-01-14T16:45:00Z",
      like_count: 89,
      dislike_count: 1,
      comment_count: 15,
      view_count: 278,
      bookmark_count: 45,
      tags: ["reactnative", "expo", "mobile", "crossplatform"],
      media_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop"
    }
  ];

  const mockUserInteractions = {
    1: { like: true, bookmark: false },
    2: { like: false, bookmark: true },
    3: { like: true, bookmark: true }
  };

  const mockUserProfile = {
    id: "user123",
    username: "demo_user",
    email: "demo@example.com",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  };

  // Use mock data when no real posts are available for design testing
  const displayPosts = posts.length > 0 ? posts : mockPosts;
  const displayUserInteractions = Object.keys(userInteractions).length > 0 ? userInteractions : mockUserInteractions;
  const displayUserProfile = userProfile || mockUserProfile;



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
    if (!displayUserInteractions || !displayPosts.length) return 0.5;
    return calculateUserCringeTolerance(displayUserInteractions, displayPosts);
  }, [displayUserInteractions, displayPosts]);

  // Get recommended posts based on selected sort mode
  const sortedPosts = useMemo(() => {
    if (!displayPosts.length || !displayUserProfile) return displayPosts;

    const categorizedPosts = getRecommendedPostsByCategory(
      displayPosts,
      displayUserProfile,
      displayUserInteractions,
      postInteractions,
      userCringeTolerance
    );

    switch (sortMode) {
      case 'recommended':
        return getRecommendedPosts(
          displayPosts,
          displayUserProfile,
          displayUserInteractions,
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
        return displayPosts;
    }
  }, [displayPosts, displayUserProfile, displayUserInteractions, postInteractions, userCringeTolerance, sortMode]);

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

  if (loading && displayPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400">
        <SideBar />
        <div className="pt-16 lg:pt-0 lg:ml-72">
          <div className="max-w-2xl mx-auto">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-white/30 p-4 z-10 rounded-t-xl mb-4">
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
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-white/30 p-4 z-10 rounded-t-xl mb-4">
            <h1 className="text-xl font-black text-gray-900">Explore</h1>
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
              userInteractions={displayUserInteractions}
              onInteraction={handleInteraction}
              onComment={handleComment}
              onViewPost={handleViewPostCallback}
              userProfile={displayUserProfile}
              searchQuery={searchQuery}
              sortMode={sortMode}
            />
          )}
        </div>
      </div>

      <div className="hidden xl:block">
        <ProfileBar currentUser={displayUserProfile} />
      </div>
    </div>
  );
}