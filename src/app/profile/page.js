'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase_client'
import SideBar from '../components/SideBar'
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit3, 
  Camera,
  Users,
  MessageSquare,
  Heart,
  Star,
  Trophy,
  Target,
  Briefcase
} from 'lucide-react'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    website: '',
    location: '',
    avatar_url: '',
    tags: [],
    created_at: '',
    posts_count: 0,
    followers_count: 0,
    following_count: 0
  })
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
      
      await loadProfileData(session.user.email)
      setLoading(false)
    }
    checkUser()
  }, [router])

  const loadProfileData = async (email) => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('email', email)
        .single()

      if (data) {
        setProfileData({
          username: data.username || 'User',
          email: data.email || email,
          bio: data.bio || '',
          website: data.website || '',
          location: data.location || '',
          avatar_url: data.avatar_url || '',
          tags: data.tags || [],
          created_at: data.created_at || '',
          posts_count: 0,
          followers_count: 0,
          following_count: 0
        })
        setUsername(data.username || 'User')

        const postsResponse = await supabase
          .from('posts')
          .select('id')
          .eq('profile_id', data.id)

        setProfileData(prev => ({
          ...prev,
          posts_count: postsResponse.data?.length || 0
        }))
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleEditProfile = () => {
    router.push('/settings')
  }

  const achievements = [
    { name: 'First Post', icon: Trophy, color: 'text-yellow-500', earned: true },
    { name: 'Community Builder', icon: Users, color: 'text-blue-500', earned: true },
    { name: 'Helpful', icon: Heart, color: 'text-red-500', earned: false },
    { name: 'Expert', icon: Star, color: 'text-purple-500', earned: false },
    { name: 'Goal Setter', icon: Target, color: 'text-green-500', earned: true },
    { name: 'Professional', icon: Briefcase, color: 'text-gray-500', earned: false }
  ]

  const stats = [
    { label: 'Posts', value: profileData.posts_count, icon: MessageSquare },
    { label: 'Followers', value: profileData.followers_count, icon: Users },
    { label: 'Following', value: profileData.following_count, icon: Heart }
  ]

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
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-gray-900 mb-2">👤 Profile</h1>
                <p className="text-lg text-gray-700 font-medium">
                  Your professional identity
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center md:items-start">
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                          {profileData.avatar_url ? (
                            <img 
                              src={profileData.avatar_url} 
                              alt="Profile" 
                              className="w-full h-full rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            profileData.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <button className="absolute bottom-0 right-0 bg-gray-900 text-amber-300 p-2 rounded-full hover:scale-110 transition-all duration-300 shadow-lg">
                          <Camera size={16} />
                        </button>
                      </div>
                      
                      <div className="mt-4 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">{profileData.username}</h2>
                        <p className="text-gray-600">{profileData.email}</p>
                        
                        {(profileData.location || profileData.website) && (
                          <div className="mt-2 space-y-1">
                            {profileData.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin size={14} />
                                <span>{profileData.location}</span>
                              </div>
                            )}
                            {profileData.website && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <LinkIcon size={14} />
                                <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-600">
                                  {profileData.website}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {profileData.created_at && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <Calendar size={14} />
                            <span>Joined {new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
                          <p className="text-gray-700 leading-relaxed">
                            {profileData.bio || 'No bio added yet. Share something about yourself!'}
                          </p>
                        </div>
                        <button 
                          onClick={handleEditProfile}
                          className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-amber-300 font-bold py-2 px-4 rounded-xl hover:scale-105 transition-all duration-300 shadow-md"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                      </div>
                      
                      {profileData.tags && profileData.tags.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-700 mb-2">Skills & Interests</h4>
                          <div className="flex flex-wrap gap-2">
                            {profileData.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="bg-gradient-to-r from-amber-400/20 to-yellow-400/20 text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-amber-400/30"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4">
                        {stats.map((stat) => {
                          const Icon = stat.icon
                          return (
                            <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
                              <Icon className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                              <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={24} />
                    Achievements
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {achievements.map((achievement) => {
                      const Icon = achievement.icon
                      return (
                        <div 
                          key={achievement.name}
                          className={`text-center p-4 rounded-xl border-2 transition-all duration-300 ${
                            achievement.earned 
                              ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-md' 
                              : 'bg-gray-50 border-gray-200 opacity-50'
                          }`}
                        >
                          <Icon 
                            className={`w-8 h-8 mx-auto mb-2 ${
                              achievement.earned ? achievement.color : 'text-gray-400'
                            }`}
                          />
                          <div className={`text-sm font-medium ${
                            achievement.earned ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {achievement.name}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Created your first post</p>
                        <p className="text-sm text-gray-600">Welcome to the BePro community!</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Joined BePro</p>
                        <p className="text-sm text-gray-600">Start your professional journey</p>
                      </div>
                    </div>
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