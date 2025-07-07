'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase_client'
import  useAuthStore from '../store/useUserStore'
import SideBar from '../components/SideBar'
import { Camera, Edit, Heart, MessageCircle, Bookmark, Filter, Eye, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function BeProAI() {
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [interactions, setInteractions] = useState([])
  const [comments, setComments] = useState([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    websiteUrl: ''
  })
  const [filterInteractions, setFilterInteractions] = useState('all') // all, like, dislike, bookmark, view
  const router = useRouter()
  
  // Get user data from Zustand store
  const { user, email, username, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const initializeProfile = async () => {
      if (!isAuthenticated || !user) {
        router.push('/')
        return
      }
      
      await fetchUserProfile()
      await fetchUserPosts()
      await fetchUserInteractions()
      await fetchUserComments()
      
      setLoading(false)
    }
    
    initializeProfile()
  }, [isAuthenticated, user, router])

  const fetchUserProfile = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setUserProfile(data)
      setProfileData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        bio: data.bio || '',
        githubUrl: data.github_url || '',
        linkedinUrl: data.linkedin_url || '',
        twitterUrl: data.twitter_url || '',
        websiteUrl: data.website_url || ''
      })
    }
  }

  const fetchUserPosts = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        interactions:post_interactions(id, type),
        comments:comments(id),
        views:post_views(id)
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) {
      // Process the data to count interactions
      const processedPosts = data.map(post => ({
        ...post,
        likeCount: post.interactions?.filter(i => i.type === 'like').length || 0,
        dislikeCount: post.interactions?.filter(i => i.type === 'dislike').length || 0,
        commentCount: post.comments?.length || 0,
        viewCount: post.views?.length || 0
      }))
      setPosts(processedPosts)
    }
  }

  const fetchUserInteractions = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('post_interactions')
      .select(`
        *,
        post:posts(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setInteractions(data)
  }

  const fetchUserComments = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        post:posts(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setComments(data)
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}` // Better organization with folders

    try {
      // First, remove the old avatar if it exists
      if (userProfile?.avatar_url) {
        try {
          const oldFileName = userProfile.avatar_url.split('/').pop()
          const oldFilePath = `avatars/${oldFileName}`
          await supabase.storage
            .from('user-images')
            .remove([oldFilePath])
        } catch (removeError) {
          console.log('No old avatar to remove or error removing:', removeError)
        }
      }

      // Upload the new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Don't overwrite existing files
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Error uploading avatar: ' + uploadError.message)
        return
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-images')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profile')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        alert('Error updating profile: ' + updateError.message)
        return
      }

      // Update local state
      setUserProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      console.log('Avatar uploaded successfully!')

    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred: ' + error.message)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return
    
    const { error } = await supabase
      .from('profile')
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        bio: profileData.bio,
        github_url: profileData.githubUrl,
        linkedin_url: profileData.linkedinUrl,
        twitter_url: profileData.twitterUrl,
        website_url: profileData.websiteUrl
      })
      .eq('id', user.id)

    if (!error) {
      setIsEditingProfile(false)
      fetchUserProfile()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filteredInteractions = interactions.filter(interaction => {
    if (filterInteractions === 'all') return true
    return interaction.type === filterInteractions
  })

  const getInteractionIcon = (type) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="w-4 h-4 text-green-500" />
      case 'dislike':
        return <ThumbsDown className="w-4 h-4 text-red-500" />
      case 'bookmark':
        return <Bookmark className="w-4 h-4 text-yellow-500" />
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />
      default:
        return <Heart className="w-4 h-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#f59e0b] mx-auto"></div>
          <p className="mt-4 text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <SideBar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6 border border-[#2a2a2a]">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden border-2 border-[#f59e0b]">
                  {userProfile?.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-[#f59e0b]">
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#f59e0b] p-2 rounded-full cursor-pointer hover:bg-[#d97706] transition-colors">
                  <Camera className="w-4 h-4 text-black" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white focus:border-[#f59e0b] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white focus:border-[#f59e0b] focus:outline-none"
                      />
                    </div>
                    <textarea
                      placeholder="Bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white h-20 resize-none focus:border-[#f59e0b] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="url"
                        placeholder="GitHub URL"
                        value={profileData.githubUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, githubUrl: e.target.value }))}
                        className="bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white focus:border-[#f59e0b] focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        value={profileData.linkedinUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        className="bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white focus:border-[#f59e0b] focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="Twitter URL"
                        value={profileData.twitterUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                        className="bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white focus:border-[#f59e0b] focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="Website URL"
                        value={profileData.websiteUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                        className="bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white focus:border-[#f59e0b] focus:outline-none"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleProfileUpdate}
                        className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-medium rounded transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      <h1 className="text-2xl font-bold">
                        {profileData.firstName || profileData.lastName 
                          ? `${profileData.firstName} ${profileData.lastName}`.trim()
                          : username}
                      </h1>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-400 mb-2">@{username}</p>
                    <p className="text-gray-400 mb-4">{email}</p>
                    {profileData.bio && (
                      <p className="text-gray-300 mb-4">{profileData.bio}</p>
                    )}
                    <div className="flex space-x-4">
                      {profileData.githubUrl && (
                        <a href={profileData.githubUrl} target="_blank" rel="noopener noreferrer" 
                           className="text-[#f59e0b] hover:text-[#d97706] transition-colors">
                          GitHub
                        </a>
                      )}
                      {profileData.linkedinUrl && (
                        <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer"
                           className="text-[#f59e0b] hover:text-[#d97706] transition-colors">
                          LinkedIn
                        </a>
                      )}
                      {profileData.twitterUrl && (
                        <a href={profileData.twitterUrl} target="_blank" rel="noopener noreferrer"
                           className="text-[#f59e0b] hover:text-[#d97706] transition-colors">
                          Twitter
                        </a>
                      )}
                      {profileData.websiteUrl && (
                        <a href={profileData.websiteUrl} target="_blank" rel="noopener noreferrer"
                           className="text-[#f59e0b] hover:text-[#d97706] transition-colors">
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-lg mb-6 border border-[#2a2a2a]">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 px-4 rounded transition-colors ${
                activeTab === 'posts' 
                  ? 'bg-[#f59e0b] text-black font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`flex-1 py-2 px-4 rounded transition-colors ${
                activeTab === 'interactions' 
                  ? 'bg-[#f59e0b] text-black font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Interactions ({interactions.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 px-4 rounded transition-colors ${
                activeTab === 'comments' 
                  ? 'bg-[#f59e0b] text-black font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Comments ({comments.length})
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'posts' && (
              <div>
                {posts.length === 0 ? (
                  <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                    <p className="text-gray-400">No posts yet</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center border border-[#f59e0b]">
                          {userProfile?.avatar_url ? (
                            <img 
                              src={userProfile.avatar_url} 
                              alt="Profile" 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="text-sm font-bold text-[#f59e0b]">
                              {username ? username.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold">{username}</span>
                            <span className="text-gray-500 text-sm">
                              {post.tags && JSON.parse(post.tags).map(tag => (
                                <span key={tag} className="inline-block bg-[#f59e0b] text-black text-xs px-2 py-1 rounded mr-1">
                                  {tag}
                                </span>
                              ))}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-3">{post.content}</p>
                          <div className="flex items-center space-x-4 text-gray-500">
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-sm">{post.likeCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsDown className="w-4 h-4" />
                              <span className="text-sm">{post.dislikeCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm">{post.commentCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">{post.viewCount}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'interactions' && (
              <div>
                {/* Interaction Filter */}
                <div className="flex items-center space-x-4 mb-4">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilterInteractions('all')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        filterInteractions === 'all' 
                          ? 'bg-[#f59e0b] text-black' 
                          : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterInteractions('like')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        filterInteractions === 'like' 
                          ? 'bg-[#f59e0b] text-black' 
                          : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      Likes
                    </button>
                    <button
                      onClick={() => setFilterInteractions('dislike')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        filterInteractions === 'dislike' 
                          ? 'bg-[#f59e0b] text-black' 
                          : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      Dislikes
                    </button>
                    <button
                      onClick={() => setFilterInteractions('bookmark')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        filterInteractions === 'bookmark' 
                          ? 'bg-[#f59e0b] text-black' 
                          : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      Bookmarks
                    </button>
                  </div>
                </div>

                {filteredInteractions.length === 0 ? (
                  <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                    <p className="text-gray-400">No interactions yet</p>
                  </div>
                ) : (
                  filteredInteractions.map(interaction => (
                    <div key={interaction.id} className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-400">
                              You {interaction.type}d this post
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(interaction.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {interaction.post && (
                            <div className="bg-[#2a2a2a] rounded p-3 border border-[#3a3a3a]">
                              <p className="text-gray-300">{interaction.post.content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div>
                {comments.length === 0 ? (
                  <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                    <p className="text-gray-400">No comments yet</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <MessageCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-400">
                              You commented on this post
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="bg-[#2a2a2a] rounded p-3 border border-[#3a3a3a] mb-3">
                            <p className="text-gray-300">{comment.content}</p>
                          </div>
                          {comment.post && (
                            <div className="bg-[#333333] rounded p-3 border border-[#4a4a4a]">
                              <p className="text-gray-400 text-sm">Original post:</p>
                              <p className="text-gray-300">{comment.post.content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}