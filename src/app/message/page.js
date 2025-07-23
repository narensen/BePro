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
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)

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
    if (username) {
      const socketInstance = io('http://localhost:3001')

      socketInstance.on('connect', () => {
        setIsConnected(true)
        socketInstance.emit('userJoin', { username })
      })

      socketInstance.on('disconnect', () => {
        setIsConnected(false)
      })

      socketInstance.on('message', (message) => {
        setMessages(prev => [...prev, message])
      })

      socketInstance.on('userJoined', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: 'system',
          content: `${data.username} joined the chat`,
          timestamp: new Date().toISOString()
        }])
      })

      socketInstance.on('userLeft', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: 'system',
          content: `${data.username} left the chat`,
          timestamp: new Date().toISOString()
        }])
      })

      socketInstance.on('onlineUsers', (count) => {
        setOnlineUsers(count)
      })

      socketInstance.on('userTyping', (data) => {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username])
      })

      socketInstance.on('userStoppedTyping', (data) => {
        setTypingUsers(prev => prev.filter(u => u !== data.username))
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [username])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSignOut = async () => {
    if (socket) {
      socket.disconnect()
    }
    await supabase.auth.signOut()
    clearUserSession()
    router.push('/')
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !username) return

    const messageData = {
      id: Date.now() + Math.random(),
      username,
      content: newMessage.trim(),
      type: 'user',
      timestamp: new Date().toISOString()
    }

    socket.emit('sendMessage', messageData)
    setNewMessage('')
    
    // Stop typing
    if (isTyping) {
      socket.emit('stopTyping', { username })
      setIsTyping(false)
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (!isTyping && socket) {
      setIsTyping(true)
      socket.emit('typing', { username })
    }

    // Clear typing after 3 seconds of inactivity
    clearTimeout(window.typingTimer)
    window.typingTimer = setTimeout(() => {
      if (isTyping && socket) {
        socket.emit('stopTyping', { username })
        setIsTyping(false)
      }
    }, 3000)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>

      <div className="min-h-screen pl-72 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 p-4 z-10 bg-gradient-to-r from-yellow-400/90 to-orange-400/90 backdrop-blur-sm border-b border-orange-300">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-gray-900">
              Messages
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-semibold text-gray-800">
                  {onlineUsers} online
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-semibold text-gray-800">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'system' ? (
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-black/20 text-gray-800 rounded-full text-sm">
                      {message.content}
                    </span>
                  </div>
                ) : (
                  <div className={`flex ${message.username === username ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.username === username
                        ? 'bg-white/90 text-gray-900 ml-4'
                        : 'bg-black/20 text-gray-900 mr-4'
                    }`}>
                      {message.username !== username && (
                        <div className="text-xs font-semibold text-gray-700 mb-1">
                          {message.username}
                        </div>
                      )}
                      <div className="break-words">{message.content}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-black/10 text-gray-700 px-4 py-2 rounded-2xl mr-4">
                  <div className="text-xs">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="sticky bottom-0 p-4 bg-gradient-to-r from-yellow-400/90 to-orange-400/90 backdrop-blur-sm border-t border-orange-300">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-white/90 border border-orange-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}