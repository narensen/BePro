import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase_client';

export default function ProfileBar({ currentUser }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [allRecommendations, setAllRecommendations] = useState([]); // Store all fetched recommendations
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showCount, setShowCount] = useState(5); // How many recommendations to show
  const [searchOffset, setSearchOffset] = useState(0); // For search pagination
  const [hasMoreSearch, setHasMoreSearch] = useState(true); // Whether there are more search results
  const [loadingMore, setLoadingMore] = useState(false); // Loading state for "show more"

  // Calculate similarity score between two users
  const calculateSimilarity = useCallback((user1, user2) => {
    if (!user1 || !user2) return 0;
    
    let score = 0;
    let maxScore = 0;

    // Tags similarity (highest priority - 60%)
    if (user1.tags && user2.tags && Array.isArray(user1.tags) && Array.isArray(user2.tags)) {
      const tags1 = user1.tags;
      const tags2 = user2.tags;
      if (tags1.length > 0 && tags2.length > 0) {
        const commonTags = tags1.filter(tag => tags2.includes(tag));
        const tagSimilarity = commonTags.length / Math.max(tags1.length, tags2.length, 1);
        score += tagSimilarity * 0.6;
      }
    }
    maxScore += 0.6;

    // Location similarity (second priority - 30%)
    if (user1.location && user2.location && 
        typeof user1.location === 'string' && typeof user2.location === 'string') {
      const locationSimilarity = user1.location.toLowerCase().trim() === user2.location.toLowerCase().trim() ? 1 : 0;
      score += locationSimilarity * 0.3;
    }
    maxScore += 0.3;

    // University similarity (third priority - 10%)
    if (user1.university && user2.university && 
        typeof user1.university === 'string' && typeof user2.university === 'string') {
      const universitySimilarity = user1.university.toLowerCase().trim() === user2.university.toLowerCase().trim() ? 1 : 0;
      score += universitySimilarity * 0.1;
    }
    maxScore += 0.1;

    return maxScore > 0 ? score / maxScore : 0;
  }, []);

  // Handle user profile navigation
  const handleUserClick = (username) => {
    if (username) {
      router.push(`/${username}`);
    }
  };

  // Fetch recommended users based on similarity
  const fetchRecommendations = useCallback(async () => {
    if (!currentUser?.id) {
      console.warn('No current user ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // First, get the list of users that the current user is following
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      if (followingError) {
        console.error('Error fetching following list:', followingError);
      }

      const followingIds = followingData?.map(f => f.following_id) || [];
      console.log('User is following:', followingIds);

      const { data: users, error } = await supabase
        .from('profile')
        .select('id, username, email, location, university, tags, avatar_url, created_at')
        .neq('id', currentUser.id)
        .not('id', 'in', `(${followingIds.length > 0 ? followingIds.join(',') : 'null'})`)
        .limit(100); // Fetch more users for better recommendations

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (error.code === 'PGRST116') {
          setError('Table not found. Please check your database setup.');
        } else if (error.code === '42501') {
          setError('Permission denied. Please check your RLS policies.');
        } else {
          setError(`Database error: ${error.message}`);
        }
        return;
      }

      if (!users || users.length === 0) {
        setAllRecommendations([]);
        setRecommendations([]);
        return;
      }

      const usersWithScores = users.map(user => ({
        ...user,
        similarity: calculateSimilarity(currentUser, user)
      }));

      const sortedRecommendations = usersWithScores
        .sort((a, b) => b.similarity - a.similarity)
        .filter(user => user.similarity > 0);

      setAllRecommendations(sortedRecommendations);
      setRecommendations(sortedRecommendations.slice(0, showCount));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again.');
      setAllRecommendations([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, calculateSimilarity, showCount]);

  const searchUsers = useCallback(async (query, offset = 0, append = false) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchOffset(0);
      setHasMoreSearch(true);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      
      const { data: users, error } = await supabase
        .from('profile')
        .select('id, username, email, location, university, tags, avatar_url, created_at')
        .neq('id', currentUser?.id)
        .or(`username.ilike.%${query}%,email.ilike.%${query}%,location.ilike.%${query}%,university.ilike.%${query}%`)
        .range(offset, offset + 9) // Fetch 10 results (0-9)
        .limit(10);

      if (error) {
        console.error('Search error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setError(`Search failed: ${error.message}`);
        if (!append) setSearchResults([]);
        return;
      }

      const newResults = users || [];
      setHasMoreSearch(newResults.length === 10); // If we got 10 results, there might be more
      
      if (append) {
        setSearchResults(prev => [...prev, ...newResults]);
      } else {
        setSearchResults(newResults);
      }
      
      setSearchOffset(offset + newResults.length);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Search failed. Please try again.');
      if (!append) setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentUser?.id]);

  // Load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (!hasMoreSearch || isSearching || !searchQuery.trim()) return;
    
    setLoadingMore(true);
    await searchUsers(searchQuery, searchOffset, true);
    setLoadingMore(false);
  }, [hasMoreSearch, isSearching, searchQuery, searchOffset, searchUsers]);

  // Show more recommendations
  const showMoreRecommendations = useCallback(() => {
    const newShowCount = showCount + 5;
    setShowCount(newShowCount);
    setRecommendations(allRecommendations.slice(0, newShowCount));
  }, [showCount, allRecommendations]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchOffset(0);
      setHasMoreSearch(true);
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  // Fetch recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Update recommendations when showCount changes
  useEffect(() => {
    if (allRecommendations.length > 0) {
      setRecommendations(allRecommendations.slice(0, showCount));
    }
  }, [showCount, allRecommendations]);

  const UserCard = ({ user, showSimilarity = false }) => {
    if (!user) return null; 
    
    return (
      <div className="bg-gradient-to-r from-amber-400/10 to-yellow-400/10 backdrop-blur-sm border border-amber-400/30 rounded-xl p-4 hover:scale-105 hover:from-amber-400/20 hover:to-yellow-400/20 transition-all duration-300 cursor-pointer shadow-lg">
        <div 
          className="flex items-center space-x-3"
          onClick={() => handleUserClick(user.username)}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-amber-400/50">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.username || 'User'} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate text-lg text-amber-300 hover:text-amber-200 transition-colors">
              {user.username || user.email?.split('@')[0] || 'Anonymous'}
            </p>
            {showSimilarity && user.similarity !== undefined && (
              <div className="flex items-center mt-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-300"
                    style={{ width: `${user.similarity * 100}%` }}
                  />
                </div>
                <span className="text-xs text-amber-200/70 ml-2 font-medium">
                  {Math.round(user.similarity * 100)}% match
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Tags */}
        {user.tags && Array.isArray(user.tags) && user.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {user.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-amber-200 text-xs rounded-full font-medium border border-amber-400/30"
              >
                {tag}
              </span>
            ))}
            {user.tags.length > 3 && (
              <span className="text-xs text-amber-200/70 flex items-center px-2">
                +{user.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const ShowMoreButton = ({ onClick, loading, text = "Show More" }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{text}</span>
        </>
      )}
    </button>
  );

  return (
    <div className="w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-l border-amber-400/30 h-full fixed right-0 top-0 overflow-y-auto shadow-2xl font-mono z-30">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-black mb-2 text-amber-300">Discover People</h2>
          <p className="text-amber-200 text-sm">Find and connect with others</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-400 hover:text-red-200 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 font-mono">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/90 border border-amber-400/30 rounded-xl text-amber-100 placeholder-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all backdrop-blur-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h3 className="text-xl font-black text-amber-300 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Results
            </h3>
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-amber-400/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-amber-200 text-sm">
                  {isSearching ? 'Searching...' : 'No users found'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
                {hasMoreSearch && (
                  <ShowMoreButton 
                    onClick={loadMoreSearchResults}
                    loading={loadingMore}
                    text="Load More Results"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {!searchQuery && (
          <div>
            <h3 className="text-xl font-black text-amber-300 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              People You May Know
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-amber-200 text-sm">Finding recommendations...</p>
                </div>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-amber-400/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-amber-200 text-sm mb-2">No recommendations available</p>
                <p className="text-amber-300/70 text-xs">
                  Add more tags and profile information to get better suggestions!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((user) => (
                  <UserCard key={user.id} user={user} showSimilarity={true} />
                ))}
                {recommendations.length < allRecommendations.length && (
                  <ShowMoreButton 
                    onClick={showMoreRecommendations}
                    loading={false}
                    text={`Show More (+${Math.min(5, allRecommendations.length - recommendations.length)})`}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}