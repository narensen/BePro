'use client'

export default function EmptyState({ searchQuery, sortMode }) {
  return (
    <div className="text-center py-20 lg:py-32 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30">
      <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 lg:mb-8 bg-gradient-to-r from-gray-200 to-gray-600 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 lg:w-10 lg:h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2 lg:mb-4">
        {searchQuery ? 'No posts found matching your search' : 'No posts available for this category'}
      </h3>
      {sortMode === 'recommended' && (
        <p className="text-gray-600 text-base lg:text-lg mt-2">
          Interact with more posts to improve your recommendations!
        </p>
      )}
    </div>
  );
}