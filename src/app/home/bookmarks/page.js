'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase_client'
import SideBar from '../../components/SideBar'
import PostCard from '../explore/components/PostCard'

export default function BeProAI() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [bookmarkedPosts, setBookmarkedPosts] = useState([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data?.session) {
        router.push('/')
        return
      }
      const session = data.session
      setUser(session.user)
      
      // Fetch username from profile table
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profile')
          .select('username')
          .eq('email', session.user.email)
          .single()

        const displayUsername = profileData?.username || session.user.user_metadata?.username || 'User'
        setUsername(displayUsername)
      } catch (error) {
        console.error('Error fetching profile username:', error)
        setUsername(session.user.user_metadata?.username || 'User')
      }
      
      setLoading(false)
      
      // Load bookmarks after user is set
      await loadBookmarks(session.user.id)
    }
    checkUser()
  }, [router])

  const loadBookmarks = async (userId) => {
    setLoadingBookmarks(true)
    console.log('Loading bookmarks for user:', userId)
    
    try {
      // First, test if bookmarks table exists with a simple query
      console.log('Testing bookmarks table access...')
      const { data: testData, error: testError } = await supabase
        .from('bookmarks')
        .select('id')
        .limit(1)

      console.log('Bookmarks table test result:', { testData, testError })

      if (testError) {
        console.error('Bookmarks table test failed:', testError)
        
        // If table doesn't exist, show empty state
        setBookmarkedPosts([])
        setLoadingBookmarks(false)
        return
      }

      // Try simplified query first
      console.log('Fetching user bookmarks...')
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      console.log('Bookmarks query result:', { bookmarksData, bookmarksError })

      if (bookmarksError) {
        console.error('Error loading bookmarks:', bookmarksError)
        console.error('Error details:', JSON.stringify(bookmarksError, null, 2))
        setLoadingBookmarks(false)
        return
      }

      console.log('Found bookmarks:', bookmarksData?.length || 0)

      if (!bookmarksData || bookmarksData.length === 0) {
        setBookmarkedPosts([])
        setLoadingBookmarks(false)
        return
      }

      // Get post IDs from bookmarks
      const postIds = bookmarksData.map(bookmark => bookmark.post_id)
      console.log('Fetching posts for IDs:', postIds)

      // Fetch the actual posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profile:user_id (
            username,
            email,
            avatar_url
          )
        `)
        .in('id', postIds)

      console.log('Posts query result:', { postsData, postsError })

      if (postsError) {
        console.error('Error loading posts:', postsError)
        setLoadingBookmarks(false)
        return
      }

      // Combine bookmark data with post data
      const bookmarkedPostsWithData = bookmarksData.map(bookmark => {
        const post = postsData?.find(p => p.id === bookmark.post_id)
        return post ? {
          ...post,
          bookmarked_at: bookmark.created_at,
          bookmark_id: bookmark.id
        } : null
      }).filter(Boolean)

      console.log('Final bookmarked posts:', bookmarkedPostsWithData)
      setBookmarkedPosts(bookmarkedPostsWithData)

    } catch (error) {
      console.error('Caught error in loadBookmarks:', error)
    } finally {
      setLoadingBookmarks(false)
    }
  }

  const handleUnbookmark = async (postId) => {
    if (!user) return

    try {
      console.log('Removing bookmark for post:', postId)
      
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)

      if (error) {
        console.error('Error removing bookmark:', error)
        return
      }

      // Remove from local state
      setBookmarkedPosts(prev => prev.filter(post => post.id !== postId))
      console.log('Bookmark removed successfully')
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
      {/* Sidebar always mounted */}
      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>

      {/* Page content with margin-left to account for sidebar */}
      <div className="ml-72">
        {loading ? (
          // Just show loading spinner in main content, not whole page
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-4xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse">
                BePro
              </div>
              <div className="w-10 h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-white/20 backdrop-blur-md border-b border-white/30 p-4 z-10">
              <h1 className="text-3xl font-black text-gray-900">
                📚 Your Bookmarks
              </h1>
              <p className="text-gray-700 mt-1">
                {bookmarkedPosts.length} saved posts
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {loadingBookmarks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading your bookmarks...</p>
                  </div>
                </div>
              ) : bookmarkedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No bookmarks yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start bookmarking posts you want to save for later!
                  </p>
                  <button
                    onClick={() => router.push('/home/explore')}
                    className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Explore Posts
                  </button>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                  {bookmarkedPosts.map((post) => (
                    <div key={post.id} className="relative">
                      {/* Bookmark indicator */}
                      <div className="absolute top-4 right-4 z-20">
                        <button
                          onClick={() => handleUnbookmark(post.id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          title="Remove bookmark"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Bookmarked date */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Saved {new Date(post.bookmarked_at).toLocaleDateString()}
                        </span>
                      </div>

                      <PostCard
                        post={post}
                        userInteractions={{}}
                        onInteraction={() => {}}
                        onComment={() => {}}
                        onViewPost={() => {}}
                        userProfile={{ id: user?.id, username }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}