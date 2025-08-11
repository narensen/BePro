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
    <div className="flex items-start gap-4 mb-6">
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100">
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
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black text-white flex items-center justify-center font-bold text-base">
            {username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        {avatarUrl && (
          <div 
            className="w-full h-full bg-gradient-to-br from-gray-800 to-black text-white hidden items-center justify-center font-bold text-lg"
            style={{ display: 'none' }}
          >
            {username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <button
            className="font-bold text-base text-gray-900 hover:text-gray-700 transition-colors"
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/${username}`, "_blank")}
          >
            @{username}
          </button>
          <span className="text-gray-400 font-medium">·</span>
          <span className="text-gray-500 font-medium">
            {formatDate(post.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;