import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" size={18} />
      <input
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white border border-gray-200 focus:border-amber-500 transition-all duration-200 shadow-sm"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;