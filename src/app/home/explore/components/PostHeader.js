import React from 'react';
import { formatDate } from '../utils/dateUtils';

const PostHeader = ({ post }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold transition-transform duration-300 hover:scale-110">
      {post.username?.charAt(0).toUpperCase() || 'U'}
    </div>
    <div>
      <div className="font-semibold text-gray-900 transition-colors duration-300 hover:text-yellow-600">
        @{post.username || 'user'}
      </div>
      <div className="text-sm text-gray-500">{formatDate(post.created_at)}</div>
    </div>
  </div>
);

export default PostHeader;