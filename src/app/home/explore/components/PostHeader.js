import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { formatTimestamp } from '../../../../lib/dateUtils';

const PostHeader = ({ post }) => {
  const username = post.username;
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!post?.email && !username) return;

      const { data, error } = await supabase
        .from('profile')
        .select('username, avatar_url')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else if (data) {
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    fetchUserProfile();
  }, [username, post]);

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-amber-200 flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${username}'s avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <span className="text-white font-bold text-sm">
            {username?.charAt(0).toUpperCase() || 'U'}
          </span>
        )}
        {avatarUrl && (
          <span 
            className="text-white font-bold text-sm hidden items-center justify-center w-full h-full"
            style={{ display: 'none' }}
          >
            {username?.charAt(0).toUpperCase() || 'U'}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          className="font-semibold text-gray-900 hover:text-amber-600 transition-colors duration-200"
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/${username}`, "_blank")}
        >
          @{username}
        </button>
        <span className="text-gray-400">·</span>
        <span className="text-gray-500 text-sm">
          {formatTimestamp(post.created_at)}
        </span>
      </div>
    </div>
  );
};

export default PostHeader;