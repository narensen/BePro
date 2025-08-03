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
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            className="font-bold text-gray-900 hover:underline text-[15px]"
            onClick={() => window.open(`https://bepro.live/${username}`, "_blank")}
          >
            {username}
          </button>
          <span className="text-gray-500 text-[15px]">@{username}</span>
          <span className="text-gray-500 text-[15px]">·</span>
          <span className="text-gray-500 text-[15px] hover:underline cursor-pointer">
            {formatDate(post.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;