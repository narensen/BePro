'use client'

export default function ChatHeader({ activeConversation, otherUserTyping, isConnected, goBackToConversations }) {
  return (
    <div className="sticky top-0 z-20 p-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex items-center space-x-3 shadow-sm">
      <button
        onClick={goBackToConversations}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-yellow-400">
        {activeConversation.otherUser?.avatar_url ? (
          <img src={activeConversation.otherUser.avatar_url} alt={activeConversation.otherUsername} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-white font-bold">
            {activeConversation.otherUsername?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        )}
      </div>
      <div>
        <a 
          href={`https://bepro.live/${activeConversation.otherUsername}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 hover:underline"
        >
          {activeConversation.otherUsername}
        </a>
        {otherUserTyping && <p className="text-sm text-green-600">typing...</p>}
        {!isConnected && <p className="text-sm text-red-600">Offline</p>}
      </div>
    </div>
  )
}