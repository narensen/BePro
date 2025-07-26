'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase_client'
import SideBar from '../components/SideBar'
import useUserStore from '../store/useUserStore'
import io from 'socket.io-client'

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
  const [notifications, setNotifications] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showConversationsList, setShowConversationsList] = useState(true)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const activeConversationRef = useRef(null);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

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

  // Initialize Socket.io connection
  useEffect(() => {
    if (username && user?.id) {
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? 'https://bepro-socket.onrender.com/' 
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

  // Fetch avatars for conversations
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

  // Effect to fetch unread counts and subscribe to real-time updates
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

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Search users
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

  // Debounced search
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
    setShowConversationsList(false) // Hide conversations list on mobile
    
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
    setShowConversationsList(false) // Hide conversations list on mobile
    
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

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono overflow-hidden relative">
      {/* Mobile-First Sidebar */}
      <SideBar />

      <div className="h-screen lg:pl-72 flex overflow-hidden">
        {/* Mobile: Show either conversations list OR chat */}
        {/* Desktop: Show both side by side */}
        
        {/* Conversations List - Mobile Conditional, Desktop Always Visible */}
        <div className={`mt-16 lg:mt-0 ${
          showConversationsList ? 'flex' : 'hidden lg:flex'
        } w-full lg:w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex-col h-full`}>
          {/* Header */}
          <div className="p-3 lg:p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-400/20 to-orange-400/20">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="text-lg lg:text-xl font-black text-gray-900">Messages</h2>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-xs lg:text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connected' : 'Offline'}
              </span>
              {!isConnected && (
                <span className="text-xs text-gray-500">(Messages may not send)</span>
              )}
            </div>
          </div>

          {/* Add User Search */}
          {showAddUser && (
            <div className="p-3 lg:p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search users to message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-orange-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-32 lg:max-h-40 overflow-y-auto space-y-2">
                  {searchResults.map((userResult) => (
                    <div
                      key={userResult.id}
                      onClick={() => startConversation(userResult)}
                      className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="relative w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                        {userResult.avatar_url ? (
                          <img src={userResult.avatar_url} alt={userResult.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {userResult.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{userResult.username}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {`No users found matching "${searchQuery}"`}
                </div>
              )}
            </div>
          )}

          {/* Conversations List Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 lg:p-8 text-center text-gray-500">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">{`Start one with the '+' button.`}</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.conversationId}
                  onClick={() => selectConversation(conversation)}
                  className={`p-3 lg:p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    activeConversation?.conversationId === conversation.conversationId ? 'bg-orange-50 border-l-4 border-orange-400' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-yellow-400">
                        {conversation.otherUser?.avatar_url ? (
                            <img src={conversation.otherUser.avatar_url} alt={conversation.otherUsername} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-lg lg:text-xl">
                                {conversation.otherUsername?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 truncate text-sm lg:text-base">{conversation.otherUsername}</p>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                      <p className="text-xs lg:text-sm text-gray-500 truncate">
                        {conversation.lastMessage ? (
                          <>
                            {conversation.lastMessage.senderUsername === username ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </>
                        ) : 'No messages yet...'}
                      </p>
                      {unreadCounts[conversation.conversationId] > 0 && (
                          <span className="ml-2 flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCounts[conversation.conversationId]}
                          </span>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area - Mobile Conditional, Desktop Always Visible */}
        <div className={`${
          !showConversationsList || activeConversation ? 'flex' : 'hidden lg:flex'
        } flex-1 flex-col h-full`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 lg:p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200 flex items-center space-x-3">
                {/* Mobile Back Button */}
                <button
                  onClick={goBackToConversations}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
                
                <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-yellow-400">
                    {activeConversation.otherUser?.avatar_url ? (
                        <img src={activeConversation.otherUser.avatar_url} alt={activeConversation.otherUsername} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-white font-bold text-sm lg:text-base">
                            {activeConversation.otherUsername?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    )}
                </div>
                <div>
                  <a 
                    href={`https://bepro.live/${activeConversation.otherUsername}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:underline text-sm lg:text-base"
                  >
                    {activeConversation.otherUsername}
                  </a>
                  {otherUserTyping && <p className="text-xs lg:text-sm text-green-600">typing...</p>}
                  }
                  {!isConnected && <p className="text-xs lg:text-sm text-red-600">Offline</p>}
                  }
                </div>
              </div>

              {/* Messages Scrollable Area */}
              <div className="flex-1 p-3 lg:p-4 overflow-y-auto bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="space-y-3 lg:space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderUsername === username ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] lg:max-w-xs xl:max-w-md px-3 lg:px-4 py-2 rounded-2xl ${
                        message.senderUsername === username
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}>
                        <div className="break-words text-sm lg:text-base">{message.content}</div>
                        <div className={`text-xs mt-1 text-right ${
                          message.senderUsername === username ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-3 lg:p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex space-x-2 lg:space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={`Message ${activeConversation.otherUsername}...`}
                    className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm lg:text-base"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-2xl font-semibold hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 text-sm lg:text-base"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="text-center text-gray-600 p-6">
                <h3 className="text-lg lg:text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-sm lg:text-base">Choose one from the list or start a new chat.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}