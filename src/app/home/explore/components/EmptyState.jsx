'use client'

export default function EmptyState({ searchQuery, sortMode }) {
  return (
    <div className="text-center py-16 bg-white">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {searchQuery ? 'No posts found' : 'No posts available'}
      </h3>
      <p className="text-gray-500">
        {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
      </p>
      {sortMode === 'recommended' && (
        <p className="text-gray-400 text-sm mt-2">
          Interact with more posts to improve your recommendations!
        </p>
      )}
    </div>
  );
}