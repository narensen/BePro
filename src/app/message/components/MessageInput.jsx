'use client'

export default function MessageInput({ newMessage, activeConversation, isConnected, sendMessage, handleTyping }) {
  return (
    <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 pb-6">
      <form onSubmit={sendMessage} className="flex space-x-3">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder={`Message ${activeConversation.otherUsername}...`}
          className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !isConnected}
          className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-600 text-gray-900 rounded-2xl font-semibold hover:from-gray-300 hover:to-gray-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}