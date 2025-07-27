'use client'

export default function UserSearch({
  showAddUser,
  searchQuery,
  searchResults,
  isSearching,
  setSearchQuery,
  startConversation
}) {
  if (!showAddUser) return null;

  return (
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
      
      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-2">
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
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}