import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase_client';
import { formatDate } from '../utils/dateUtils';

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
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${username}'s avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initial if image fails to load
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
          className="font-bold text-black/80 cursor-pointer hover:underline"
          onClick={() => window.open(`https://bepro.live/${username}`, "_blank")}
        >
          {`@${username}`}
        </button>
        <span className="text-gray-500 text-sm">·</span>
        <span className="text-gray-500 text-sm">
          {formatDate(post.created_at)}
        </span>
      </div>
    </div>
  );
};

export default PostHeader;