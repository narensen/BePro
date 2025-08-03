export default function SortOptions({ sortMode, setSortMode }) {
  const sortOptions = [
    { key: 'recommended', label: 'For You', desc: 'Personalized recommendations' },
    { key: 'trending', label: 'Trending', desc: 'Most engaged posts' },
    { key: 'recent', label: 'Recent', desc: 'Latest posts' },
    { key: 'lowCringe', label: 'Premium', desc: 'Low cringe, high quality' }
  ];

  return (
    <div className="flex gap-1 mb-4 border-b border-amber-200/50">
      {sortOptions.map((mode) => (
        <button
          key={mode.key}
          onClick={() => setSortMode(mode.key)}
          className={`px-4 py-3 text-sm font-bold transition-all duration-200 border-b-2 hover:bg-amber-50/50 ${
            sortMode === mode.key
              ? 'border-amber-500 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-gray-700 hover:text-gray-900'
          }`}
          title={mode.desc}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}