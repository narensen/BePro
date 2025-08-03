'use client'

export default function EmptyState({ searchQuery, sortMode }) {
  return (
    <div className="text-center py-16 bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl">
      <div className="w-16 h-16 mx-auto mb-4 bg-amber-100/50 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {searchQuery ? 'No posts found' : 'No posts available'}
      </h3>
      <p className="text-gray-600">
        {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
      </p>
      {sortMode === 'recommended' && (
        <p className="text-amber-600 text-sm mt-2 font-medium">
          Interact with more posts to improve your recommendations!
        </p>
      )}
    </div>
  );
}