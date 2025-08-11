export default function SortOptions({ sortMode, setSortMode }) {
  const sortOptions = [
    { key: 'recommended', label: 'For You', desc: 'Personalized recommendations' },
    // Removed other sorting options but keep the logic intact
    // { key: 'trending', label: 'Trending', desc: 'Most engaged posts' },
    // { key: 'recent', label: 'Recent', desc: 'Latest posts' },
    // { key: 'lowCringe', label: 'Premium', desc: 'Low cringe, high quality' }
  ];

  // Return null to hide the sort options UI completely
  // The recommendation system will continue to work with the default 'recommended' mode
  return null;
}