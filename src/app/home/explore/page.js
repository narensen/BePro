'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase_client'
import { Search } from 'lucide-react'
import SideBar from '../../components/SideBar'
import PostCard from '../../components/PostCard'

export default function Explore() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userTags, setUserTags] = useState([])
  const [posts, setPosts] = useState([])
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session?.user) {
        router.push('/')
        return
      }
      setUser(session.user)
    }
    checkUser()
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return

      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('tags')
        .eq('email', user.email)
        .single()

      if (profileError || !profile?.tags) {
        console.error('User tags not found', profileError)
        return
      }

      setUserTags(profile.tags)

      const { data: allPosts, error: postError } = await supabase
        .from('posts')
        .select('*')

      if (postError || !allPosts) {
        console.error('Failed to fetch posts', postError)
        return
      }

      const scoredPosts = allPosts.map((post) => {
        const overlap = post.tags?.filter((tag) => profile.tags.includes(tag)) || []
        return { ...post, score: overlap.length }
      })

      const sortedPosts = scoredPosts.sort((a, b) => b.score - a.score)
      setPosts(sortedPosts)
      setLoading(false)
    }

    fetchData()
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex">
      <div className="w-72 fixed top-0 left-0 h-full z-30">
        <SideBar user={user} username={user?.user_metadata?.username || 'User'} onSignOut={handleSignOut} />
      </div>

      <div className="flex-1 ml-72 min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
        <div className="flex flex-col items-center px-4 py-6">
          <div className="relative w-full max-w-md mb-8 hover:scale-105 transition-all ease duration-300">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-black text-amber-300 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Search"
            />
          </div>

          <div className="w-full max-w-xl space-y-6">
            {loading ? (
              <p className="text-white/80 text-center">Loading...</p>
            ) : posts.length === 0 ? (
              <p className="text-white/80 text-center">No posts to show yet.</p>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} user={user} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
