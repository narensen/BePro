'use client'

import { useState, useEffect, useRef } from 'react' // FIX: Import useRef
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
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // FIX: Create a ref to hold the current active conversation.
  // This solves the "stale closure" problem in your socket event handlers.
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
        
        // FIX: Use the ref to get the most up-to-date activeConversation
        if (activeConversationRef.current?.conversationId === conversationId) {
          setMessages(conversationMessages || [])
        }
      })

      // Handle new direct messages in real-time
      socketInstance.on('newDirectMessage', (message) => {
        console.log('Received new direct message:', message)
        
        // FIX: Use the ref here. This is the key change that makes the chat window update.
        if (activeConversationRef.current?.conversationId === message.conversationId) {
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === message.id)
            return exists ? prev : [...prev, message]
          })
        }
      })

      // Handle message notifications
      socketInstance.on('messageNotification', (notification) => {
        console.log('Received message notification:', notification)
        
        // FIX: Use the ref to check the current conversation
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

      // Handle typing indicators
      socketInstance.on('userTypingInConversation', (data) => {
        console.log('User typing:', data)
        // FIX: Use the ref to check the current conversation
        if (activeConversationRef.current?.conversationId === data.conversationId && data.username !== username) {
          setOtherUserTyping(true)
        }
      })

      socketInstance.on('userStoppedTypingInConversation', (data) => {
        console.log('User stopped typing:', data)
        // FIX: Use the ref to check the current conversation
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

  // Update active conversation when conversations list changes
  useEffect(() => {
    if (activeConversation && conversations.length > 0) {
      const updatedConversation = conversations.find(
        conv => conv.conversationId === activeConversation.conversationId
      )
      if (updatedConversation) {
        setActiveConversation(prev => ({ ...prev, ...updatedConversation }))
      }
    }
  }, [conversations])

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

  const handleSignOut = async () => {
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
    
    if (socket && isConnected) {
      socket.emit('joinConversation', { otherUsername: otherUser.username })
    }
  }

  const selectConversation = (conversation) => {
    if (activeConversation && socket) {
      socket.emit('leaveConversation', { conversationId: activeConversation.conversationId })
    }
    
    setActiveConversation(conversation)
    setMessages([])
    setOtherUserTyping(false)
    
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

  // The entire return statement (JSX) is your UI, including the Chat Window.
  // It was already correct. The problem was the logic providing data to it.
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm animate-slide-in-right"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">New message from {notification.from}</p>
                  <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>

      <div className="min-h-screen pl-72 flex">
        {/* Conversations List */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-400/20 to-orange-400/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900">Messages</h2>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {!isConnected && (
                <span className="text-xs text-gray-500">(Messages may not send)</span>
              )}
            </div>
          </div>

          {/* Add User Search */}
          {showAddUser && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
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
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => startConversation(user)}
                      className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.username}</span>
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

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.58-.378l-5.42 1.08 1.08-5.42A8.959 8.959 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a new chat by clicking the + button</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.conversationId}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    activeConversation?.conversationId === conversation.conversationId ? 'bg-orange-50 border-orange-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {conversation.otherUsername?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 truncate">{conversation.otherUsername}</p>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.senderUsername === username ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area (This is your "Chat Window") */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {activeConversation.otherUsername?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeConversation.otherUsername}</h3>
                    {otherUserTyping && (
                      <p className="text-sm text-green-600">typing...</p>
                    )}
                    {!isConnected && (
                      <p className="text-sm text-red-600">Offline</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderUsername === username ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderUsername === username
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 ml-12'
                            : 'bg-white text-gray-900 mr-12 shadow-sm'
                        }`}>
                          <div className="break-words">{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.senderUsername === username ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {otherUserTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-700 px-4 py-2 rounded-2xl mr-12 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={`Message ${activeConversation.otherUsername}...`}
                    className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-2xl font-semibold hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Send
                  </button>
                </form>
                {!isConnected && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Not connected to server. Check your internet connection.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.58-.378l-5.42 1.08 1.08-5.42A8.959 8.959 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the sidebar or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}