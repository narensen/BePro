import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  console.log('SearchBar rendering with:', { searchQuery, setSearchQuery }); // Debug log
  
  return (
    <div className="relative mb-6">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-300" size={20} />
      <input
        className="w-full pl-12 pr-4 py-3 rounded-3xl bg-black/80 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20 transition-all duration-300 hover:bg-black/60 focus:bg-black/60"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;