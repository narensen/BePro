'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import SideBar from '../components/SideBar'
import useUserStore from '../store/useUserStore'
import io from 'socket.io-client'

import MessagesHeader from './components/MessagesHeader'
import ConversationsList from './components/ConversationsList'
import ChatArea from './components/ChatArea'
import MobileLayout from './components/MobileLayout'

export default function MessagesPage() {
  const router = useRouter()
  const { user, username, clearUserSession } = useUserStore()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [showConversationsList, setShowConversationsList] = useState(true)
  const [notifications, setNotifications] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const activeConversationRef = useRef(null)
  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data?.session) {
        clearUserSession()
        router.push('/')
      }
    }

    checkSession()
  }, [router, clearUserSession])

  // FRONTEND ONLY - Simple function to mark messages as read
  const markConversationAsRead = async (otherUsername) => {
    if (!username || !otherUsername) return
    
    try {
      console.log(`Marking messages as read from ${otherUsername}`)
      
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_username', otherUsername)
        .eq('receiver_username', username)
        .eq('is_read', false)
      
      if (error) {
        console.error('Error marking messages as read:', error)
      } else {
        console.log('Successfully marked messages as read')
        
        // Update conversations list to reflect new unread counts
        const updatedConversations = await getUserConversations()
        setConversations(updatedConversations || [])
        
        // Clear unread count for this conversation
        const conversationId = [username, otherUsername].sort().join('_')
        setUnreadCounts(prev => ({
          ...prev,
          [conversationId]: 0
        }))
      }
    } catch (error) {
      console.error('Error in markConversationAsRead:', error)
    }
  }

  // Function to get user conversations (frontend version)
  const getUserConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_username.eq.${username},receiver_username.eq.${username}`)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching conversations:', error)
        return []
      }
      
      const conversationsMap = new Map()
      
      data?.forEach(msg => {
        const otherUser = msg.sender_username === username ? msg.receiver_username : msg.sender_username
        const conversationId = [username, otherUser].sort().join('_')
        
        if (!conversationsMap.has(conversationId) || 
            new Date(msg.created_at) > new Date(conversationsMap.get(conversationId).created_at)) {
          
          conversationsMap.set(conversationId, {
            conversationId,
            otherUsername: otherUser,
            lastMessage: {
              content: msg.content.content,
              senderUsername: msg.content.senderUsername,
              timestamp: msg.content.timestamp
            },
            created_at: msg.created_at,
            unreadCount: 0 // Will be calculated below
          })
        }
      })
      
      const conversations = Array.from(conversationsMap.values()).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
      
      // Calculate unread counts
      for (const conversation of conversations) {
        const { data: unreadData } = await supabase
          .from('messages')
          .select('id')
          .eq('sender_username', conversation.otherUsername)
          .eq('receiver_username', username)
          .eq('is_read', false)
        
        conversation.unreadCount = unreadData?.length || 0
      }
      
      return conversations
    } catch (err) {
      console.error('Error in getUserConversations:', err)
      return []
    }
  }

  // SOCKET SETUP
  useEffect(() => {
    if (username && user?.id) {
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_SOCKET_SERVER_URL 
        : 'http://localhost:3001'
      
      const socketInstance = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000
      })

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket server')
        setIsConnected(true)
        socketInstance.emit('userJoin', { username, userId: user.id })
      })

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket server')
        setIsConnected(false)
        setOtherUserTyping(false)
      })

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      socketInstance.on('conversationsList', (conversationsList) => {
        console.log('Received conversations list:', conversationsList)
        setConversations(conversationsList || [])
        
        const unreadMap = {}
        conversationsList?.forEach(conv => {
          if (conv.unreadCount > 0) {
            unreadMap[conv.conversationId] = conv.unreadCount
          }
        })
        setUnreadCounts(unreadMap)
      })

      socketInstance.on('conversationMessages', (data) => {
        const { conversationId, messages: conversationMessages } = data
        console.log('Received conversation messages:', data)
        
        if (activeConversationRef.current?.conversationId === conversationId) {
          setMessages(conversationMessages || [])
        }
      })

      socketInstance.on('newDirectMessage', (message) => {
        console.log('Received new direct message:', message)
        
        if (activeConversationRef.current?.conversationId === message.conversationId) {
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === message.id)
            return exists ? prev : [...prev, message]
          })
        }
      })

      socketInstance.on('messageNotification', (notification) => {
        console.log('Received message notification:', notification)
        
        if (activeConversationRef.current?.otherUsername !== notification.from) {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            from: notification.from,
            message: notification.message,
            conversationId: notification.conversationId,
            timestamp: new Date()
          }])
          
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== Date.now()))
          }, 5000)
        }
      })

      socketInstance.on('userTypingInConversation', (data) => {
        console.log('User typing:', data)
        if (activeConversationRef.current?.conversationId === data.conversationId && data.username !== username) {
          setOtherUserTyping(true)
        }
      })

      socketInstance.on('userStoppedTypingInConversation', (data) => {
        console.log('User stopped typing:', data)
        if (activeConversationRef.current?.conversationId === data.conversationId && data.username !== username) {
          setOtherUserTyping(false)
        }
      })

      socketInstance.on('messageError', (error) => {
        console.error('Message error:', error)
        alert('Failed to send message: ' + error.error)
      })

      setSocket(socketInstance)

      return () => {
        console.log('Cleaning up socket connection')
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        socketInstance.disconnect()
      }
    }
  }, [username, user?.id])

  useEffect(() => {
    if (activeConversation?.conversationId && conversations.length > 0) {
      const updatedConversation = conversations.find(
        (conv) => conv.conversationId === activeConversation.conversationId
      )

      if (updatedConversation) {
        const hasChanged = JSON.stringify(updatedConversation.lastMessage) !== JSON.stringify(activeConversation.lastMessage)
        
        if (hasChanged) {
            setActiveConversation(prev => ({
                ...prev,
                ...updatedConversation
            }))
        }
      }
    }
  }, [conversations, activeConversation])

  useEffect(() => {
    const fetchAvatarsForConversations = async () => {
      const convosWithoutAvatars = conversations.filter(
        (convo) => !convo.otherUser?.avatar_url
      )

      if (convosWithoutAvatars.length === 0) {
        return
      }

      const usernamesToFetch = convosWithoutAvatars.map(
        (convo) => convo.otherUsername
      )

      const { data: profiles, error } = await supabase
        .from('profile')
        .select('username, avatar_url')
        .in('username', usernamesToFetch)

      if (error) {
        console.error('Error batch fetching profile avatars:', error)
        return
      }

      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.username] = profile.avatar_url
        return acc
      }, {})

      setConversations((prevConvos) =>
        prevConvos.map((convo) => {
          const newAvatarUrl = profileMap[convo.otherUsername]
          if (newAvatarUrl) {
            return {
              ...convo,
              otherUser: {
                ...(convo.otherUser || { username: convo.otherUsername }),
                avatar_url: newAvatarUrl,
              },
            }
          }
          return convo
        })
      )
    }

    if (conversations.length > 0) {
      fetchAvatarsForConversations()
    }
  }, [conversations])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      
      const { data: users, error } = await supabase
        .from('profile')
        .select('id, username, email, avatar_url')
        .neq('id', user?.id)
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

      if (error) {
        console.error('Search error:', error)
        return
      }

      setSearchResults(users || [])
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, user?.id])

  const handleSignout = async () => {
    if (socket) {
      socket.disconnect()
    }
    await supabase.auth.signOut()
    clearUserSession()
    router.push('/')
  }

  // UPDATED startConversation function
  const startConversation = async (otherUser) => {
    const conversationId = [username, otherUser.username].sort().join('_')
    const conversation = {
      conversationId,
      otherUsername: otherUser.username,
      otherUser: otherUser 
    }
    
    if (activeConversation && socket) {
      socket.emit('leaveConversation', { conversationId: activeConversation.conversationId })
    }
    
    setActiveConversation(conversation)
    setMessages([])
    setOtherUserTyping(false)
    setShowAddUser(false)
    setSearchQuery('')
    setSearchResults([])
    setShowConversationsList(false)
    
    // Clear unread count immediately
    setUnreadCounts(prev => ({
      ...prev,
      [conversation.conversationId]: 0
    }))
    
    // FRONTEND: Directly mark messages as read in Supabase
    await markConversationAsRead(otherUser.username)
    
    if (socket && isConnected) {
      socket.emit('joinConversation', { otherUsername: otherUser.username })
    }
  }

  // UPDATED selectConversation function
  const selectConversation = async (conversation) => {
    if (activeConversation?.conversationId === conversation.conversationId) return

    console.log('Selecting conversation:', conversation.otherUsername)

    if (activeConversation && socket) {
      socket.emit('leaveConversation', { conversationId: activeConversation.conversationId })
    }
    
    setActiveConversation(conversation)
    setMessages([])
    setOtherUserTyping(false)
    setShowConversationsList(false)
    
    // Clear unread count immediately for instant UI feedback
    setUnreadCounts(prev => ({
      ...prev,
      [conversation.conversationId]: 0
    }))
    
    // FRONTEND: Directly mark messages as read in Supabase
    await markConversationAsRead(conversation.otherUsername)
    
    // Join conversation for real-time messaging
    if (socket && isConnected) {
      socket.emit('joinConversation', { otherUsername: conversation.otherUsername })
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !activeConversation || !isConnected) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    
    if (isTyping) {
      socket.emit('stopTypingInConversation', { 
        conversationId: activeConversation.conversationId 
      })
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }

    socket.emit('sendDirectMessage', {
      receiverUsername: activeConversation.otherUsername,
      content: messageContent
    })
  }

  const handleTyping = (e) => {
    const value = e.target.value
    setNewMessage(value)
    
    if (!socket || !activeConversation || !isConnected) return

    if (!isTyping && value.trim()) {
      setIsTyping(true)
      socket.emit('typingInConversation', { 
        conversationId: activeConversation.conversationId,
        receiverUsername: activeConversation.otherUsername
      })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socket && activeConversation) {
        socket.emit('stopTypingInConversation', { 
          conversationId: activeConversation.conversationId 
        })
        setIsTyping(false)
      }
    }, 3000)

    if (!value.trim() && isTyping) {
      socket.emit('stopTypingInConversation', { 
        conversationId: activeConversation.conversationId 
      })
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const goBackToConversations = () => {
    setShowConversationsList(true)
    setActiveConversation(null)
    setMessages([])
    setOtherUserTyping(false)
  }

  const sharedProps = {
    conversations,
    activeConversation,
    messages,
    newMessage,
    isConnected,
    otherUserTyping,
    showAddUser,
    searchQuery,
    searchResults,
    isSearching,
    unreadCounts,
    username,
    formatLastMessageTime,
    messagesEndRef,
    setShowAddUser,
    setSearchQuery,
    startConversation,
    selectConversation,
    sendMessage,
    handleTyping,
    goBackToConversations
  }

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono overflow-hidden relative">
      <SideBar />

      <div className="hidden lg:flex h-screen lg:ml-72">
        <ConversationsList {...sharedProps} />
        <ChatArea {...sharedProps} />
      </div>

      <MobileLayout 
        {...sharedProps}
        showConversationsList={showConversationsList}
      />
    </div>
  )
}