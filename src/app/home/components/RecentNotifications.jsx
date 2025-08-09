'use client'

import { useState, useEffect } from 'react'
import { Bell, UserPlus, MessageSquare, Heart, Bookmark, Eye, Calendar, AtSign } from 'lucide-react'
import { supabase } from '../../lib/supabase_client'
import Link from 'next/link'

export default function RecentNotifications({ username, userProfile }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userProfile?.id) return

      try {
        setLoading(true)
        
        // Get recent followers
        const { data: followersData } = await supabase
          .from('followers')
          .select(`
            id,
            created_at,
            profile:follower_id (
              username,
              avatar_url
            )
          `)
          .eq('following_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(10)

        // Get recent messages
        const { data: messagesData } = await supabase
          .from('messages')
          .select('id, sender_username, content, timestamp, is_read')
          .eq('receiver_username', username)
          .order('timestamp', { ascending: false })
          .limit(10)

        // Get recent post interactions
        const { data: interactionsData } = await supabase
          .from('post_interactions')
          .select(`
            id,
            type,
            created_at,
            post:posts!inner (
              id,
              content,
              profile_id
            ),
            profile:user_id (
              username,
              avatar_url
            )
          `)
          .eq('posts.profile_id', userProfile.id)
          .neq('user_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(15)

        // Get mention notifications from ping table
        const { data: mentionData } = await supabase
          .from('ping')
          .select(`
            id,
            type,
            content,
            is_read,
            created_at,
            mentioned_by_profile:mentioned_by (
              username,
              avatar_url
            ),
            post:posts (
              id,
              content
            ),
            comment:comments (
              id,
              content
            )
          `)
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(15)

        // Combine and format notifications
        const allNotifications = []

        // Add follower notifications
        followersData?.forEach(follow => {
          allNotifications.push({
            id: `follow_${follow.id}`,
            type: 'follow',
            user: follow.profile,
            timestamp: follow.created_at,
            message: `started following you`,
            isRead: true // Followers are always considered "read"
          })
        })

        // Add message notifications
        messagesData?.forEach(message => {
          allNotifications.push({
            id: `message_${message.id}`,
            type: 'message',
            user: { username: message.sender_username },
            timestamp: message.timestamp,
            message: `sent you a message: "${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}"`,
            isRead: message.is_read
          })
        })

        // Add interaction notifications
        interactionsData?.forEach(interaction => {
          const actionText = {
            'like': 'liked your post',
            'dislike': 'disliked your post',
            'bookmark': 'bookmarked your post'
          }[interaction.type] || 'interacted with your post'

          allNotifications.push({
            id: `interaction_${interaction.id}`,
            type: interaction.type,
            user: interaction.profile,
            timestamp: interaction.created_at,
            message: actionText,
            postContent: interaction.post?.content?.substring(0, 30) + '...',
            isRead: true // Post interactions are always considered "read"
          })
        })

        // Add mention notifications
        mentionData?.forEach(mention => {
          const contextText = mention.comment ? 'mentioned you in a comment' : 'mentioned you in a post'
          const contentPreview = mention.content?.substring(0, 50) + (mention.content?.length > 50 ? '...' : '')

          allNotifications.push({
            id: `mention_${mention.id}`,
            type: 'mention',
            user: mention.mentioned_by_profile,
            timestamp: mention.created_at,
            message: contextText,
            postContent: contentPreview,
            isRead: mention.is_read
          })
        })

        // Sort by timestamp and take most recent
        const sortedNotifications = allNotifications
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 20)

        setNotifications(sortedNotifications)
        
        // Count unread notifications (messages and mentions can be unread)
        const unread = sortedNotifications.filter(n => !n.isRead).length
        setUnreadCount(unread)

      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up real-time subscriptions
    const followersChannel = supabase
      .channel('followers_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${userProfile?.id}`
        },
        () => fetchNotifications()
      )
      .subscribe()

    const messagesChannel = supabase
      .channel('messages_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_username=eq.${username}`
        },
        () => fetchNotifications()
      )
      .subscribe()

    const interactionsChannel = supabase
      .channel('interactions_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_interactions'
        },
        () => fetchNotifications()
      )
      .subscribe()

    const mentionChannel = supabase
      .channel('mentions_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ping',
          filter: `user_id=eq.${userProfile?.id}`
        },
        () => fetchNotifications()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(followersChannel)
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(interactionsChannel)
      supabase.removeChannel(mentionChannel)
    }
  }, [username, userProfile?.id])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={16} className="text-blue-400" />
      case 'message':
        return <MessageSquare size={16} className="text-green-400" />
      case 'like':
        return <Heart size={16} className="text-red-400" />
      case 'bookmark':
        return <Bookmark size={16} className="text-yellow-400" />
      case 'mention':
        return <AtSign size={16} className="text-purple-400" />
      default:
        return <Bell size={16} className="text-gray-400" />
    }
  }

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl">
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-xl lg:text-2xl font-black text-amber-300">Recent Activity</h3>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-600" />
          </div>
          <h4 className="text-lg font-bold text-amber-300 mb-2">No notifications yet</h4>
          <p className="text-amber-200/80 text-sm">
            Start engaging with the community to see activity here!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                notification.isRead 
                  ? 'bg-gray-800/30 border border-gray-700/50' 
                  : 'bg-amber-500/10 border border-amber-500/30'
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-amber-400/50 flex-shrink-0">
                {notification.user?.avatar_url ? (
                  <img
                    src={notification.user.avatar_url}
                    alt={notification.user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {notification.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getNotificationIcon(notification.type)}
                  <Link 
                    href={`/${notification.user?.username}`}
                    className="font-bold text-amber-300 hover:text-amber-200 transition-colors text-sm lg:text-base"
                  >
                    @{notification.user?.username}
                  </Link>
                  <span className="text-amber-200/80 text-sm">
                    {notification.message}
                  </span>
                </div>
                
                {notification.postContent && (
                  <p className="text-amber-200/60 text-xs mb-2 italic">
                    "{notification.postContent}"
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-amber-200/60">
                  <Calendar size={12} />
                  <span>{formatNotificationTime(notification.timestamp)}</span>
                </div>
              </div>

              {!notification.isRead && (
                <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {/* TODO: Navigate to full notifications page */}}
            className="text-amber-300 hover:text-amber-200 font-bold text-sm transition-colors"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  )
}