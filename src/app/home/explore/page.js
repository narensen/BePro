'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js'
import { Plus, X } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import SideBar from '../../components/SideBar';
import useUserStore from '../../store/useUserStore';
import ExploreHeader from './components/ExploreHeader';
import SearchAndSort from './components/SearchAndSort';
import PostsList from './components/PostsList';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';
import ProfileBar from './components/ProfileBar';
import { usePostData } from './hooks/usePostData';
import { handleViewPost } from './utils/viewsUtils';
import {
  toggleLike,
  toggleDislike,
  toggleBookmark,
  submitComment,
  createPost,
} from '../../utils/postActions.js';
import { 
  getRecommendedPosts, 
  getRecommendedPostsByCategory,
  calculateUserCringeTolerance 
} from './utils/recommendationSystem';
import MentionTextarea from '../../../components/MentionTextarea';
import ImageUpload from '../../../components/ImageUpload';
import './styles.css';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('recommended');
  const [postInteractions, setPostInteractions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalImages, setModalImages] = useState([]);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  
  const router = useRouter();
  const { user } = useUserStore();
  const { loading, posts, setPosts, userInteractions, setUserInteractions, userProfile } = usePostData(user);
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
  const userCringeTolerance = useMemo(() => {
    if (!userInteractions || !posts.length) return 0.5;
    return calculateUserCringeTolerance(userInteractions, posts);
  }, [userInteractions, posts]);
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
        setUserInteractions(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            [type]: !currentState
          }
        }));
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

  const handleComment = useCallback(async (postId, content, images = []) => {
    try {
      const success = await submitComment(postId, userProfile?.id, content, null, images);
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

  const handleCreatePost = useCallback(async () => {
    if (!modalContent.trim() || !userProfile?.id) return;

    setModalSubmitting(true);
    try {
      const result = await createPost(userProfile.id, modalContent.trim(), [], modalImages);
      
      if (result) {
        // Add the new post to the current posts list
        setPosts(prevPosts => [result, ...prevPosts]);
        
        // Reset modal state
        setModalContent('');
        setModalImages([]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setModalSubmitting(false);
    }
  }, [modalContent, modalImages, userProfile?.id, setPosts]);

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
      <SideBar />

      <div className="min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72 xl:mr-80" >
        <div className="px-3 lg:px-6 py-4 lg:py-6 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-4xl lg:mx-auto">
            <ExploreHeader />
            
            {/* Create Post Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white p-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <Plus className="w-6 h-6" />
                Create Post
              </button>
            </div>

            <SearchAndSort 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortMode={sortMode}
              setSortMode={setSortMode}
            />

            {filteredPosts.length === 0 ? (
              <EmptyState searchQuery={searchQuery} sortMode={sortMode} />
            ) : (
              <PostsList
                posts={filteredPosts}
                userInteractions={userInteractions}
                onInteraction={handleInteraction}
                onComment={handleComment}
                onViewPost={handleViewPostCallback}
                userProfile={userProfile}
                searchQuery={searchQuery}
                sortMode={sortMode}
              />
            )}
          </div>
        </div>
      </div>

      <div className="hidden xl:block">
        <ProfileBar currentUser={userProfile} />
      </div>
      
      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What&apos;s on your mind?
                </label>
                <MentionTextarea
                  value={modalContent}
                  onChange={setModalContent}
                  rows={6}
                  placeholder="Share your insights, ask questions, or start a discussion... Type @ to mention someone!"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none font-medium"
                />
                <div className="text-right mt-2 text-sm text-gray-500">
                  {modalContent.length}/1000
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Images (optional)
                </label>
                <ImageUpload
                  currentImages={modalImages}
                  onImagesChange={setModalImages}
                  maxImages={4}
                  placeholder="Add images to your post"
                />
              </div>
              
              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={modalSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!modalContent.trim() || modalSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}