'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase_client'
import SideBar from '../../components/SideBar'
import { Users, MessageSquare, TrendingUp, Heart, Star, Calendar } from 'lucide-react'

export default function Communities() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
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
    }
    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const communityData = [
    {
      id: 1,
      name: "Frontend Developers",
      description: "Share frontend tips, frameworks, and build amazing UIs together",
      members: 1247,
      posts: 89,
      trending: true,
      icon: "💻",
      category: "Development"
    },
    {
      id: 2,
      name: "Career Growth",
      description: "Accelerate your professional journey with mentorship and advice",
      members: 892,
      posts: 156,
      trending: false,
      icon: "🚀",
      category: "Professional"
    },
    {
      id: 3,
      name: "Product Management",
      description: "Product strategy, roadmaps, and building great products",
      members: 654,
      posts: 73,
      trending: true,
      icon: "📊",
      category: "Business"
    },
    {
      id: 4,
      name: "Design Systems",
      description: "Creating cohesive design languages and scalable components",
      members: 543,
      posts: 42,
      trending: false,
      icon: "🎨",
      category: "Design"
    },
    {
      id: 5,
      name: "AI & Machine Learning",
      description: "Explore the future of AI and implement ML solutions",
      members: 1156,
      posts: 234,
      trending: true,
      icon: "🤖",
      category: "Technology"
    },
    {
      id: 6,
      name: "Startup Founders",
      description: "Building companies from zero to one with fellow entrepreneurs",
      members: 387,
      posts: 128,
      trending: false,
      icon: "💡",
      category: "Business"
    }
  ]

  const CommunityCard = ({ community }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{community.icon}</div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{community.name}</h3>
            <p className="text-sm text-amber-600 font-medium">{community.category}</p>
          </div>
        </div>
        {community.trending && (
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-400 px-2 py-1 rounded-full">
            <TrendingUp size={12} className="text-gray-900" />
            <span className="text-xs font-bold text-gray-900">Trending</span>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{community.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{community.members.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{community.posts}</span>
          </div>
        </div>
      </div>
      
      <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-amber-300 font-bold py-3 px-4 rounded-xl hover:scale-105 transition-all duration-300 shadow-md">
        Join Community
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>

      <div className="ml-72">
        {loading ? (
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
            <div className="sticky top-0 bg-white/20 backdrop-blur-md border-b border-white/30 p-6 z-10">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-black text-gray-900 mb-2">🌟 Communities</h1>
                <p className="text-lg text-gray-700 font-medium">
                  Connect, learn, and grow with like-minded professionals
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                    <div className="flex items-center gap-4 mb-4">
                      <Heart className="text-red-500" size={24} />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Why Join Communities?</h2>
                        <p className="text-gray-600">Accelerate your growth through meaningful connections</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Star className="text-amber-500" size={16} />
                        <span>Learn from industry experts</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="text-blue-500" size={16} />
                        <span>Network with professionals</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="text-green-500" size={16} />
                        <span>Join exclusive events</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {communityData.map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Can&apos;t find your community?</h3>
                    <p className="text-gray-600 mb-6">
                      Start your own community and bring together professionals who share your passion
                    </p>
                    <button className="bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-xl hover:scale-105 transition-all duration-300 shadow-md">
                      Create Community
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}