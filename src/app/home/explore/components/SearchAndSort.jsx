'use client'

import SearchBar from './SearchBar';
import SortOptions from './SortOptions';

export default function SearchAndSort({ searchQuery, setSearchQuery, sortMode, setSortMode }) {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm border-b border-amber-400/30 shadow-lg rounded-b-xl">
      <div className="p-4">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <SortOptions sortMode={sortMode} setSortMode={setSortMode} />
    </div>
  );
}