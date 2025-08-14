'use client'

import SearchBar from './SearchBar';
import SortOptions from './SortOptions';

export default function SearchAndSort({ searchQuery, setSearchQuery, sortMode, setSortMode }) {
  return (
    <div className="mobile-search-container mb-6 lg:mb-8 mobile:space-y-3 space-y-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <SortOptions sortMode={sortMode} setSortMode={setSortMode} />
    </div>
  );
}