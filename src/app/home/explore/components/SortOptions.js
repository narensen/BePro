export default function SortOptions({ sortMode, setSortMode }) {
  const sortOptions = [
    { key: 'recommended', label: 'For You', desc: 'Personalized recommendations' },
    { key: 'trending', label: 'Trending', desc: 'Most engaged posts' },
    { key: 'recent', label: 'Recent', desc: 'Latest posts' },
    { key: 'lowCringe', label: 'Premium', desc: 'Low cringe, high quality' }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {sortOptions.map((mode) => (
        <button
          key={mode.key}
          onClick={() => setSortMode(mode.key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            sortMode === mode.key
              ? 'bg-white text-orange-600 shadow-lg scale-105'
              : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
          }`}
          title={mode.desc}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}