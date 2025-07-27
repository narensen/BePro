'use client'

export default function MessagesHeader({ isConnected, showAddUser, setShowAddUser }) {
  return (
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
      
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
          {isConnected ? 'Connected' : 'Offline'}
        </span>
        {!isConnected && (
          <span className="text-xs text-gray-500">(Messages may not send)</span>
        )}
      </div>
    </div>
  )
}