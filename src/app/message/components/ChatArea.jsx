'use client'

import ChatHeader from './ChatHeader'
import MessagesList from './MessagesList'
import MessageInput from './MessageInput'

export default function ChatArea({
  activeConversation,
  messages,
  newMessage,
  isConnected,
  otherUserTyping,
  formatTime,
  messagesEndRef,
  username,
  sendMessage,
  handleTyping,
  goBackToConversations
}) {
  return (
    <div className="flex-1 flex-col h-full flex">
      {activeConversation ? (
        <>
          <ChatHeader
            activeConversation={activeConversation}
            otherUserTyping={otherUserTyping}
            isConnected={isConnected}
            goBackToConversations={goBackToConversations}
          />

          <MessagesList
            messages={messages}
            username={username}
            formatTime={formatTime}
            messagesEndRef={messagesEndRef}
          />

          <MessageInput
            newMessage={newMessage}
            activeConversation={activeConversation}
            isConnected={isConnected}
            sendMessage={sendMessage}
            handleTyping={handleTyping}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="text-center text-gray-600 p-6">
            <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
            <p>Choose one from the list or start a new chat.</p>
          </div>
        </div>
      )}
    </div>
  )
}