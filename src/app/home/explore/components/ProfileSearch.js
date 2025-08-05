import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase_client';

const ProfileSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(10);
    if (!error && data) setResults(data);
    else setResults([]);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-orange-200 rounded-lg"
          placeholder="Search profiles..."
        />
        <button type="submit" className="px-3 py-2 bg-orange-500 text-white rounded-lg">Search</button>
      </form>
      <div>
        {results.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-3 py-2 cursor-pointer hover:bg-orange-100 rounded-lg"
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/${user.username}`, "_blank")}
          >
            <img src={user.avatar_url || '/default-avatar.png'} alt="profile" className="w-8 h-8 rounded-full border" />
            <span className="text-orange-800 font-medium">{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSearch;