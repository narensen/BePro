'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from "../lib/supabase_client";
import useUserStore from "../store/useUserStore"; // ADD THIS
import SideBar from "../components/SideBar";
import FollowButton from "../components/FollowButton";
import FollowersModal from "../components/FollowersModal";
import { useFollowers } from "../utils/useFollowers";

export default function ProfilePage({ params }) {
  // Unwrap params using React.use()
  const { username } = use(params);
  
  // Get current user from Zustand
  const { user: currentUser } = useUserStore(); // ADD THIS
  
  const [user, setUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [followersModalOpen, setFollowersModalOpen] = useState(false)
  const [followingModalOpen, setFollowingModalOpen] = useState(false)

  // Use the followers hook
  const { followerCount, followingCount, refetch: refetchFollowers } = useFollowers(user?.id);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        
        // Get user profile
        const { data: userData, error: userError } = await supabase
          .from("profile")
          .select("*")
          .eq("username", username)
          .single();

        if (userError || !userData) {
          setError('User not found')
          setLoading(false)
          return
        }

        setUser(userData)

        // Get user's posts
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .eq("profile_id", userData.id)
          .order("created_at", { ascending: false });

        setUserPosts(postsData || [])

        // Get user's liked posts
        const { data: likedData } = await supabase
          .from("post_interactions")
          .select(`
            *,
            posts (
              id,
              username,
              content,
              tags,
              created_at,
              profile_id
            )
          `)
          .eq("user_id", userData.id)
          .eq("type", "like")
          .order("created_at", { ascending: false });

        setLikedPosts(likedData || [])

      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfileData()
    }
  }, [username])

  const handleFollowChange = (isNowFollowing) => {
    // Refetch followers data when follow status changes
    refetchFollowers();
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-4xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse">
            BePro Profile
          </div>
          <div className="w-10 h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-800 mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state (user not found)
  if (error || !user) {
    const punchlines = [
      "Productivity not found. BePro, not BeLost.",
      "This page is dead. You shouldn't be. BePro, not BeLazy.",
      "Wandering off won't build your future. Refocus, Pro.",
      "You lost? This ain't a vacation. Get back to building.",
      "Dead end. Now pivot like a real builder.",
      "Not all who wander are lost — except you. Fix that.",
      "Pro move? Not this. Go ship something.",
    ];

    const randomIndex = Math.floor(Math.random() * punchlines.length);
    const [headline, subline] = punchlines[randomIndex].split(". ");

    return (
      <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen flex justify-center items-center font-sans">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl w-[45rem] h-[27rem] flex flex-col justify-center items-center hover:scale-105 transition-all duration-300 border border-gray-700">
          <h1 className="mb-10 text-3xl font-black">Error 404</h1>
          <h1 className="text-3xl font-black text-amber-300 text-center mb-4 transition-all duration-500">
            {headline}.
          </h1>
          <p className="text-xl text-center text-amber-200 italic transition-all duration-700 delay-150">
            {subline}
          </p>
        </div>
      </div>
    );
  }

  // Main profile content
  return (
    <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen font-sans">
      <div className="w-72 fixed bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 top-0 left-0 h-full z-30 border-r border-gray-700">
        <SideBar
          user={user}
          username={user?.username || 'user'}
        />
      </div>
      
      <div className="flex-1 pl-72 min-h-screen">
        <div className="max-w-6xl mx-auto py-12 px-8">
          
          {/* Profile Header - Consistent Box Theme */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 shadow-2xl rounded-2xl p-8 mb-16 hover:scale-105 transition-all duration-300 border border-gray-700">
            <div className="flex items-center space-x-8 mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-gray-900 text-5xl font-black overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-6xl font-black text-amber-300">{user.username}</h1>
                  <FollowButton
                    currentUserId={currentUser?.id}
                    targetUserId={user.id}
                    onFollowChange={handleFollowChange}
                  />
                </div>
                <p className="text-2xl text-amber-200 mb-4">{user.name}</p>
                <p className="text-amber-200/80 text-lg">
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Stats - In Box */}
            <div className="flex space-x-12 mb-8">
              <div className="text-center">
                <div className="text-4xl font-black text-amber-300">
                  {userPosts?.length || 0}
                </div>
                <div className="text-amber-200 text-lg">Posts</div>
              </div>
              <button
                onClick={() => setFollowersModalOpen(true)}
                className="text-center hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <div className="text-4xl font-black text-amber-300">
                  {followerCount || 0}
                </div>
                <div className="text-amber-200 text-lg hover:text-amber-100">Followers</div>
              </button>
              <button
                onClick={() => setFollowingModalOpen(true)}
                className="text-center hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <div className="text-4xl font-black text-amber-300">
                  {followingCount || 0}
                </div>
                <div className="text-amber-200 text-lg hover:text-amber-100">Following</div>
              </button>
              <div className="text-center">
                <div className="text-4xl font-black text-amber-300">
                  {likedPosts?.length || 0}
                </div>
                <div className="text-amber-200 text-lg">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-amber-300">
                  {user.tags?.length || 0}
                </div>
                <div className="text-amber-200 text-lg">Tags</div>
              </div>
            </div>

            {/* Tags - In Box */}
            {user.tags && user.tags.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {user.tags.map((tag, index) => (
                  <span key={index} className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content Grid - Clean Separation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* User's Posts Column */}
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-8 drop-shadow-lg">
                {currentUser?.id === user.id ? 'My Posts' : `${user.username}'s Posts`}
                <span className="text-gray-800 text-xl ml-3 font-medium">({userPosts?.length || 0})</span>
              </h2>
              
              <div className="space-y-6">
                {userPosts && userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post.id} className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-2xl p-6 border border-gray-700 hover:scale-105 transition-all duration-300 shadow-xl">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-amber-200/80 text-sm">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-amber-300 text-lg leading-relaxed mb-4 font-medium">{post.content}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="bg-orange-500/20 text-orange-200 text-xs px-3 py-1 rounded-full border border-orange-400/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-2xl border border-gray-700">
                    <div className="text-amber-300 text-xl mb-4 font-bold">No posts yet</div>
                    <div className="text-amber-200">
                      {currentUser?.id === user.id ? 'Time to start sharing your pro journey!' : 'This user hasn\'t posted yet'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Liked Posts Column */}
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-8 drop-shadow-lg">
                {currentUser?.id === user.id ? 'Liked Posts' : `${user.username}'s Liked Posts`}
                <span className="text-gray-800 text-xl ml-3 font-medium">({likedPosts?.length || 0})</span>
              </h2>
              
              <div className="space-y-6">
                {likedPosts && likedPosts.length > 0 ? (
                  likedPosts.map((interaction) => (
                    <div key={interaction.id} className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-2xl p-6 border border-gray-700 hover:scale-105 transition-all duration-300 shadow-xl">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-yellow-200 font-bold">
                          @{interaction.posts?.username}
                        </span>
                        <span className="text-amber-200/80 text-sm">
                          {new Date(interaction.posts?.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-amber-300 text-lg leading-relaxed mb-4 font-medium">{interaction.posts?.content}</p>
                      {interaction.posts?.tags && interaction.posts.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {interaction.posts.tags.map((tag, index) => (
                            <span key={index} className="bg-yellow-500/20 text-yellow-200 text-xs px-3 py-1 rounded-full border border-yellow-400/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-2xl border border-gray-700">
                    <div className="text-amber-300 text-xl mb-4 font-bold">No liked posts yet</div>
                    <div className="text-amber-200">
                      {currentUser?.id === user.id ? 'Start exploring and supporting other pros!' : 'This user hasn\'t liked any posts yet'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      <FollowersModal
        userId={user?.id}
        username={user?.username}
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        type="followers"
      />

      {/* Following Modal */}
      <FollowersModal
        userId={user?.id}
        username={user?.username}
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        type="following"
      />
    </div>
  );
}