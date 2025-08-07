'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, MessageSquare, Heart, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase_client'

export default function StatsOverview({ userProfile }) {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
    totalFollowers: 0,
    totalMessages: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile?.id) return

      try {
        setLoading(true)

        // Get post count and engagement
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, like_count, view_count')
          .eq('profile_id', userProfile.id)

        // Get follower count
        const { count: followerCount } = await supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userProfile.id)

        // Get message count (sent + received)
        const { count: sentMessages } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_username', userProfile.username)

        const { count: receivedMessages } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_username', userProfile.username)

        const totalPosts = postsData?.length || 0
        const totalLikes = postsData?.reduce((sum, post) => sum + (post.like_count || 0), 0) || 0
        const totalViews = postsData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0
        const totalMessages = (sentMessages || 0) + (receivedMessages || 0)

        setStats({
          totalPosts,
          totalLikes,
          totalViews,
          totalFollowers: followerCount || 0,
          totalMessages
        })

      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userProfile?.id, userProfile?.username])

  const statItems = [
    {
      icon: BarChart3,
      label: 'Posts',
      value: stats.totalPosts,
      color: 'text-blue-400'
    },
    {
      icon: Heart,
      label: 'Likes',
      value: stats.totalLikes,
      color: 'text-red-400'
    },
    {
      icon: Eye,
      label: 'Views',
      value: stats.totalViews,
      color: 'text-green-400'
    },
    {
      icon: Users,
      label: 'Followers',
      value: stats.totalFollowers,
      color: 'text-purple-400'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      value: stats.totalMessages,
      color: 'text-orange-400'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-xl">
          <BarChart3 className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-xl lg:text-2xl font-black text-amber-300">Your Stats</h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gray-700 rounded-full mx-auto mb-2"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statItems.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-gray-800/50 rounded-xl p-4 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-black/30 rounded-lg">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-amber-300 mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-amber-200/80 text-xs lg:text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}