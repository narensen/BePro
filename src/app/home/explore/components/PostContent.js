import React from 'react';
import { highlightQuery } from '../utils/highlightQuery';

const PostContent = ({ post, searchQuery }) => (
  <div>
    {/* Highlighted Post Content */}
    <p className="text-gray-800 mb-4 leading-relaxed transition-colors duration-300 hover:text-gray-900">
      {highlightQuery(post.content, searchQuery)}
    </p>

    {/* Post Tags */}
    {post.tags && post.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm transition-all duration-300 hover:bg-yellow-200 hover:scale-105 cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default PostContent;
