import { useState } from 'react';
import { useFollowers } from '../utils/useFollowers';

import Link from 'next/link';

const FollowersModal = ({ userId, username, isOpen, onClose, type = 'followers' }) => {
  const { followers, following, loading } = useFollowers(userId);
  
  const data = type === 'followers' ? followers : following;
  const title = type === 'followers' ? 'Followers' : 'Following';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg pl-72 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-amber-300">{title}</h2>
          <button
            onClick={onClose}
            className="text-amber-300 hover:text-amber-400 text-xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-amber-200 mt-2">Loading...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-amber-200">No {title.toLowerCase()} yet</p>
            </div>
          ) : (
            data.map((item) => {
              const profile = item.profile;
              return (
                <div key={item.id} className="flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      profile.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1">
                   <Link href={`https://bepro.live/${profile.username}`}>
                    <h3 className="text-amber-300 font-bold">{profile.username}</h3>
                    </Link>
                    <p className="text-amber-200 text-sm">{profile.email}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;