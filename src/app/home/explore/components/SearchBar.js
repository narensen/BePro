import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery }) => (
  <div className="relative mb-8 transform transition-all duration-700 opacity-0 translate-y-4" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-300" size={20} />
    <input
      className="w-full pl-12 pr-4 py-3 rounded-3xl bg-black text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20 transition-all duration-300 hover:bg-black/60 focus:bg-black/60"
      placeholder="Search posts..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
);

export default SearchBar;