// server.js
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = createServer(app)

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your Next.js app URL
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

// Store connected users and messages in memory
const connectedUsers = new Map()
const messages = [] // Store messages in memory

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // Handle user joining
  socket.on('userJoin', (data) => {
    const { username } = data
    connectedUsers.set(socket.id, { username, socketId: socket.id })
    
    // Send existing messages to the newly connected user
    socket.emit('existingMessages', messages)
    
    // Notify others that user joined
    socket.broadcast.emit('userJoined', { username })
    
    // Send current online users count to all clients
    io.emit('onlineUsers', connectedUsers.size)
    
    console.log(`${username} joined the chat`)
  })

  // Handle new messages
  socket.on('sendMessage', (messageData) => {
    // Store message in memory
    messages.push(messageData)
    
    // Keep only last 100 messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift()
    }
    
    // Broadcast message to all connected clients
    io.emit('message', messageData)
    
    console.log(`Message from ${messageData.username}: ${messageData.content}`)
  })

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', data)
  })

  socket.on('stopTyping', (data) => {
    socket.broadcast.emit('userStoppedTyping', data)
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      connectedUsers.delete(socket.id)
      
      // Notify others that user left
      socket.broadcast.emit('userLeft', { username: user.username })
      
      // Send updated online users count
      io.emit('onlineUsers', connectedUsers.size)
      
      console.log(`${user.username} left the chat`)
    }
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
  console.log(`Accepting connections from http://localhost:3000`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})