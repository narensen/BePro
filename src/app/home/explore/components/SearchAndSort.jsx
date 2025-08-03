'use client'

import SearchBar from './SearchBar';
import SortOptions from './SortOptions';

export default function SearchAndSort({ searchQuery, setSearchQuery, sortMode, setSortMode }) {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-lg rounded-b-xl">
      <div className="p-4">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <SortOptions sortMode={sortMode} setSortMode={setSortMode} />
    </div>
  );
}