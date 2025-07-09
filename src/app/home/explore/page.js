'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase_client';
import SideBar from '../../components/SideBar';
import useUserStore from '../../store/useUserStore';
import LoadingSpinner from '../explore/components/LoadingSpinner'
import SearchBar from '../explore/components/SearchBar';
import PostCard from '../explore/components/PostCard';
import { usePostData } from '../explore/hooks/usePostData';
import { handleViewPost } from '../explore/utils/viewsUtils';
import {
  toggleLike,
  toggleDislike,
  toggleBookmark,
  submitComment,
} from '../../utils/postActions.js';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useUserStore();
  const { loading, posts, setPosts, userInteractions, setUserInteractions, userProfile } = usePostData(user);

  // Filter posts based on search
  const filteredPosts = posts.filter(post => 
    !searchQuery || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      }
    } catch (error) {
      console.error(`Error handling ${type}:`, error);
    }
  }, [userProfile?.id, setPosts, setUserInteractions]);

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
      <div className="flex">
        <div className="w-72 fixed bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono top-0 left-0 h-full z-30">
          <SideBar 
            user={user} 
            username={user?.user_metadata?.username || 'user'} 
            onSignOut={async () => { 
              await supabase.auth.signOut(); 
              router.push('/'); 
            }} 
          />
        </div>
        <div className="flex-1 ml-72 min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-72 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono fixed top-0 left-0 h-full z-30">
        <SideBar 
          user={user} 
          username={user?.user_metadata?.username || 'user'} 
          onSignOut={async () => { 
            await supabase.auth.signOut(); 
            router.push('/'); 
          }} 
        />
      </div>

      <div className="flex-1 ml-72 min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 transform transition-all duration-700 opacity-0 translate-y-4" style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>
            <h1 className="text-3xl font-bold text-white mb-2">Explore</h1>
            <p className="text-white/80">Discover posts from the community</p>
          </div>

          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          {/* Posts */}
          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 bg-white/10 rounded-xl border border-white/20 transform transition-all duration-700 opacity-0 translate-y-4" style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
                <p className="text-white/80 text-lg">
                  {searchQuery ? 'No posts found' : 'No posts yet'}
                </p>
              </div>
            ) : (
              filteredPosts.map((post, index) => (
                <div 
                  key={post.id}
                  className="transform transition-all duration-700 opacity-0 translate-y-4"
                  style={{ animation: `fadeInUp 0.6s ease-out ${0.3 + index * 0.1}s both` }}
                >
                  <PostCard
                    post={post}
                    userInteractions={userInteractions}
                    onInteraction={handleInteraction}
                    onComment={handleComment}
                    onViewPost={handleViewPostCallback}
                    userProfile={userProfile}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Enhanced CSS for smooth animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        * {
          transition-property: transform, opacity, background-color, border-color, box-shadow, color, scale;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }

        .hover\\:scale-\\[1\\.01\\]:hover {
          transform: scale(1.01);
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        button:focus,
        input:focus,
        textarea:focus {
          outline: 2px solid rgba(245, 158, 11, 0.5);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}