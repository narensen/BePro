import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" size={18} />
      <input
        className="w-full pl-10 pr-4 py-3 bg-gray-800/90 border border-amber-400/30 text-amber-100 placeholder-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all backdrop-blur-sm rounded-xl"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;