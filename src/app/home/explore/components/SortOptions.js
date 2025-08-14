export default function SortOptions({ sortMode, setSortMode }) {
  const sortOptions = [
    { key: 'recommended', label: 'For You', desc: 'Personalized recommendations' },
    { key: 'trending', label: 'Trending', desc: 'Most engaged posts' },
    { key: 'recent', label: 'Recent', desc: 'Latest posts' },
    { key: 'lowCringe', label: 'Premium', desc: 'Low cringe, high quality' }
  ];

  return (
    <div className="mobile-filter-chips flex mobile:gap-2 flex-wrap gap-2 sm:gap-3">
      {sortOptions.map((mode) => (
        <button
          key={mode.key}
          onClick={() => setSortMode(mode.key)}
          className={`mobile-filter-chip touch-target px-3 sm:px-4 py-2 rounded-full mobile:text-sm text-xs sm:text-sm font-medium transition-all duration-300 active:scale-95 ${
            sortMode === mode.key
              ? 'bg-white text-orange-600 shadow-lg scale-105'
              : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
          }`}
          title={mode.desc}
          aria-label={`Sort by ${mode.desc}`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}