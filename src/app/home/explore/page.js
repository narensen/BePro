'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase_client';
import { Search, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Eye, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import SideBar from '../../components/SideBar';
import useUserStore from '../../store/useUserStore';
import {
  toggleLike,
  toggleDislike,
  toggleBookmark,
  incrementViewCount,
  submitComment,
} from '../../utils/postActions';

// Simple loading animation component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-yellow-300 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
    </div>
    <p className="text-white/80 mt-4 font-medium">Loading posts...</p>
  </div>
);

// Comment component
const Comment = ({ comment, formatDate }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
        {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div>
        <span className="font-semibold text-gray-900 text-sm">
          @{comment.profile?.username || 'user'}
        </span>
        <span className="text-xs text-gray-500 ml-2">
          {formatDate(comment.created_at)}
        </span>
      </div>
    </div>
    <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>
  </div>
);

// Simple post card component
const PostCard = ({ post, userInteractions, onInteraction, onComment, onViewPost }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasViewedOnce, setHasViewedOnce] = useState(false);

  useEffect(() => {
    if (!hasViewedOnce) {
      onViewPost(post.id);
      setHasViewedOnce(true);
    }
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const fetchComments = async () => {
    if (comments.length > 0) return; // Already loaded
    
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:user_id(username, email)
        `)
        .eq('post_id', post.id)
        .is('parent_comment_id', null) // Only top-level comments for simplicity
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = async () => {
    const newShowState = !showComments;
    setShowComments(newShowState);
    
    if (newShowState && comments.length === 0) {
      await fetchComments();
    }
  };

  const handleComment = async () => {
    if (commentText.trim()) {
      const success = await onComment(post.id, commentText);
      if (success !== false) {
        setCommentText('');
        // Add the new comment to local state for immediate feedback
        const newComment = {
          id: Date.now(), // Temporary ID
          content: commentText,
          created_at: new Date().toISOString(),
          profile: { username: 'You' }
        };
        setComments(prev => [...prev, newComment]);
        // Refresh comments to get the real data
        setTimeout(() => fetchComments(), 500);
      }
    }
  };

  return (
    <div className="bg-white/95 rounded-xl shadow-lg border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:scale-[1.01]">
      {/* Post Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold transition-transform duration-300 hover:scale-110">
            {post.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-semibold text-gray-900 transition-colors duration-300 hover:text-yellow-600">
              @{post.username || 'user'}
            </div>
            <div className="text-sm text-gray-500">{formatDate(post.created_at)}</div>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-gray-800 mb-4 leading-relaxed transition-colors duration-300 hover:text-gray-900">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm transition-all duration-300 hover:bg-yellow-200 hover:scale-105 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interaction Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onInteraction('like', post.id, userInteractions[post.id]?.like)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                userInteractions[post.id]?.like 
                  ? 'bg-yellow-100 text-yellow-700 shadow-md' 
                  : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
              }`}
            >
              <ThumbsUp size={16} className="transition-transform duration-300 hover:scale-110" />
              <span className="font-medium">{post.like_count || 0}</span>
            </button>

            <button 
              onClick={() => onInteraction('dislike', post.id, userInteractions[post.id]?.dislike)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                userInteractions[post.id]?.dislike 
                  ? 'bg-red-100 text-red-700 shadow-md' 
                  : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
              }`}
            >
              <ThumbsDown size={16} className="transition-transform duration-300 hover:scale-110" />
              <span className="font-medium">{post.dislike_count || 0}</span>
            </button>

            <button 
              onClick={toggleComments}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                showComments 
                  ? 'bg-blue-100 text-blue-700 shadow-md' 
                  : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
              }`}
            >
              <MessageCircle size={16} className="transition-transform duration-300 hover:scale-110" />
              <span className="font-medium">{comments.length || post.comment_count || 0}</span>
              <div className="transition-transform duration-300">
                {showComments ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onInteraction('bookmark', post.id, userInteractions[post.id]?.bookmark)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                userInteractions[post.id]?.bookmark 
                  ? 'bg-blue-100 text-blue-700 shadow-md' 
                  : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
              }`}
            >
              <Bookmark size={16} className={`transition-all duration-300 hover:scale-110 ${
                userInteractions[post.id]?.bookmark ? 'fill-current' : ''
              }`} />
            </button>

            <div className="flex items-center gap-1 text-gray-500 px-3 py-2">
              <Eye size={16} className="transition-transform duration-300 hover:scale-110" />
              <span className="font-medium">{post.view_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section with Smooth Animation */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        showComments ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 py-4 bg-white border-t border-gray-200 space-y-4">
          {/* Add Comment */}
          <div className="flex gap-3">
            <textarea
              className="flex-1 border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:shadow-sm focus:shadow-md"
              rows={2}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              onClick={handleComment}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Loading comments...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className="transform transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
                  }}
                >
                  <Comment comment={comment} formatDate={formatDate} />
                </div>
              ))}
              {comments.length === 0 && !loadingComments && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Explore() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [userInteractions, setUserInteractions] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useUserStore();

  // Filter posts based on search
  const filteredPosts = posts.filter(post => 
    !searchQuery || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profile')
          .select('*')
          .eq('email', user.email)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Get posts
        const { data: allPosts } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (allPosts) {
          // Get interaction counts
          const postIds = allPosts.map(post => post.id);
          const { data: interactions } = await supabase
            .from('post_interactions')
            .select('post_id, type')
            .in('post_id', postIds);

          // Count interactions
          const interactionCounts = {};
          interactions?.forEach(interaction => {
            if (!interactionCounts[interaction.post_id]) {
              interactionCounts[interaction.post_id] = {
                like_count: 0,
                dislike_count: 0,
                bookmark_count: 0
              };
            }
            interactionCounts[interaction.post_id][`${interaction.type}_count`]++;
          });

          // Get user interactions
          const { data: userInteractionData } = await supabase
            .from('post_interactions')
            .select('post_id, type')
            .eq('user_id', profile?.id);

          const userInteractionMap = {};
          userInteractionData?.forEach(interaction => {
            if (!userInteractionMap[interaction.post_id]) {
              userInteractionMap[interaction.post_id] = {};
            }
            userInteractionMap[interaction.post_id][interaction.type] = true;
          });

          setUserInteractions(userInteractionMap);

          // Get comment counts
          const { data: commentCounts } = await supabase
            .from('comments')
            .select('post_id')
            .in('post_id', postIds);

          const commentCountMap = {};
          commentCounts?.forEach(comment => {
            commentCountMap[comment.post_id] = (commentCountMap[comment.post_id] || 0) + 1;
          });

          // Combine data
          const enrichedPosts = allPosts.map(post => ({
            ...post,
            ...interactionCounts[post.id],
            comment_count: commentCountMap[post.id] || 0
          }));

          setPosts(enrichedPosts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
  }, [userProfile?.id]);

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
  }, [userProfile?.id]);

  const handleViewPost = useCallback(async (postId) => {
    try {
      await incrementViewCount(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? { ...post, view_count: (post.view_count || 0) + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <div className="w-72 fixed top-0 left-0 h-full z-30">
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
      <div className="w-72 fixed top-0 left-0 h-full z-30">
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

          {/* Search */}
          <div className="relative mb-8 transform transition-all duration-700 opacity-0 translate-y-4" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-300" size={20} />
            <input
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20 transition-all duration-300 hover:bg-black/30 focus:bg-black/30"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
                    onViewPost={handleViewPost}
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

        /* Smooth transitions for all elements */
        * {
          transition-property: transform, opacity, background-color, border-color, box-shadow, color, scale;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced hover effects */
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }

        .hover\\:scale-\\[1\\.01\\]:hover {
          transform: scale(1.01);
        }

        /* Smooth scrollbar */
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

        /* Focus states */
        button:focus,
        input:focus,
        textarea:focus {
          outline: 2px solid rgba(245, 158, 11, 0.5);
          outline-offset: 2px;
        }

        /* Reduced motion for accessibility */
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