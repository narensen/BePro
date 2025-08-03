export default function SortOptions({ sortMode, setSortMode }) {
  const sortOptions = [
    { key: 'recommended', label: 'For You', desc: 'Personalized recommendations' },
    { key: 'trending', label: 'Trending', desc: 'Most engaged posts' },
    { key: 'recent', label: 'Recent', desc: 'Latest posts' },
    { key: 'lowCringe', label: 'Premium', desc: 'Low cringe, high quality' }
  ];

  return (
    <div className="flex gap-1 mb-4 border-b border-gray-200">
      {sortOptions.map((mode) => (
        <button
          key={mode.key}
          onClick={() => setSortMode(mode.key)}
          className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 hover:bg-gray-50 ${
            sortMode === mode.key
              ? 'border-blue-500 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
          title={mode.desc}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}