'use client'

import SearchBar from './SearchBar';
import SortOptions from './SortOptions';

export default function SearchAndSort({ searchQuery, setSearchQuery, sortMode, setSortMode }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="p-4">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <SortOptions sortMode={sortMode} setSortMode={setSortMode} />
    </div>
  );
}