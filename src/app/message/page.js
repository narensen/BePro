'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase_client'

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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showConversationsList, setShowConversationsList] = useState(true)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const activeConversationRef = useRef(null);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const markMessagesAsRead = async (conversationId, otherUsername) => {
    if (!username || !otherUsername) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_username', username)
        .eq('sender_username', otherUsername)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        // Update local state to remove unread indicators
        setUnreadCounts(prev => ({
          ...prev,
          [conversationId]: 0
        }));
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  };

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
          
          if (message.senderUsername !== username) {
            markMessagesAsRead(message.conversationId, message.senderUsername);
          }
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
      );

      if (updatedConversation) {
        const hasChanged = JSON.stringify(updatedConversation.lastMessage) !== JSON.stringify(activeConversation.lastMessage);
        
        if (hasChanged) {
            setActiveConversation(prev => ({
                ...prev,
                ...updatedConversation
            }));
        }
      }
    }
  }, [conversations, activeConversation]);
  useEffect(() => {
    const fetchAvatarsForConversations = async () => {
      const convosWithoutAvatars = conversations.filter(
        (convo) => !convo.otherUser?.avatar_url
      );

      if (convosWithoutAvatars.length === 0) {
        return;
      }

      const usernamesToFetch = convosWithoutAvatars.map(
        (convo) => convo.otherUsername
      );

      const { data: profiles, error } = await supabase
        .from('profile')
        .select('username, avatar_url')
        .in('username', usernamesToFetch);

      if (error) {
        console.error('Error batch fetching profile avatars:', error);
        return;
      }

      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.username] = profile.avatar_url;
        return acc;
      }, {});

      setConversations((prevConvos) =>
        prevConvos.map((convo) => {
          const newAvatarUrl = profileMap[convo.otherUsername];
          if (newAvatarUrl) {
            return {
              ...convo,
              otherUser: {
                ...(convo.otherUser || { username: convo.otherUsername }),
                avatar_url: newAvatarUrl,
              },
            };
          }
          return convo;
        })
      );
    };

    if (conversations.length > 0) {
      fetchAvatarsForConversations();
    }
  }, [conversations]);
  useEffect(() => {
    if (!username) return;

    const fetchUnreadCounts = async () => {
      const { data, error } = await supabase.rpc('get_unread_message_counts', {
        p_username: username,
      });

      if (error) {
        console.error('Error fetching unread counts:', error);
      } else {
        const counts = (data || []).reduce((acc, item) => {
          acc[item.conversation_id] = item.unread_count;
          return acc;
        }, {});
        setUnreadCounts(counts);
      }
    };

    fetchUnreadCounts();

    const channel = supabase
      .channel('public:messages:unread')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_username=eq.${username}`,
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);
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

  const startConversation = (otherUser) => {
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
    markMessagesAsRead(conversation.conversationId, otherUser.username);
    
    if (socket && isConnected) {
      socket.emit('joinConversation', { otherUsername: otherUser.username })
    }
  }

  const selectConversation = (conversation) => {
    if (activeConversation?.conversationId === conversation.conversationId) return;

    if (activeConversation && socket) {
      socket.emit('leaveConversation', { conversationId: activeConversation.conversationId })
    }
    
    setActiveConversation(conversation)
    setMessages([])
    setOtherUserTyping(false)
    setShowConversationsList(false)
    markMessagesAsRead(conversation.conversationId, conversation.otherUsername);
    
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
    markMessagesAsRead,
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

      {}
      <div className="hidden lg:flex h-screen lg:ml-72">
        <ConversationsList {...sharedProps} markMessagesAsRead={markMessagesAsRead} />
        <ChatArea {...sharedProps} markMessagesAsRead={markMessagesAsRead} />
      </div>

      {}
      <MobileLayout 
        {...sharedProps}
        showConversationsList={showConversationsList}
        markMessagesAsRead={markMessagesAsRead}
      />
    </div>
  )
}