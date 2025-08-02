'use client'

import MessagesHeader from './MessagesHeader'
import UserSearch from './UserSearch'

export default function ConversationsList({
  conversations,
  activeConversation,
  isConnected,
  showAddUser,
  searchQuery,
  searchResults,
  isSearching,
  unreadCounts,
  username,
  formatLastMessageTime,
  setShowAddUser,
  setSearchQuery,
  startConversation,
  selectConversation
}) {
  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex-col h-full flex">
      <MessagesHeader 
        isConnected={isConnected}
        showAddUser={showAddUser}
        setShowAddUser={setShowAddUser}
      />

      <UserSearch
        showAddUser={showAddUser}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        setSearchQuery={setSearchQuery}
        startConversation={startConversation}
      />

      {/* Conversations List Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Start one with the '+' button.</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.conversationId}
              onClick={() => selectConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                activeConversation?.conversationId === conversation.conversationId ? 'bg-orange-50 border-l-4 border-orange-400' : 'border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-yellow-400">
                  {conversation.otherUser?.avatar_url ? (
                    <img src={conversation.otherUser.avatar_url} alt={conversation.otherUsername} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {conversation.otherUsername?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
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
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.senderUsername === username ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </>
                      ) : 'No messages yet...'}
                    </p>
                    {unreadCounts[conversation.conversationId] > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCounts[conversation.conversationId] > 99 ? '99+' : unreadCounts[conversation.conversationId]}
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
  )
}