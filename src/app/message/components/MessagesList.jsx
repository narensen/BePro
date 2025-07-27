'use client'

export default function MessagesList({ messages, username, formatTime, messagesEndRef }) {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderUsername === username ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-md px-4 py-2 rounded-2xl ${
              message.senderUsername === username
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900'
                : 'bg-white text-gray-900 shadow-sm'
            }`}>
              <div className="break-words">{message.content}</div>
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
  )
}