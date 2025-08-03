import React from 'react';
import { highlightQuery } from '../utils/highlightQuery';

const PostContent = ({ post, searchQuery }) => (
  <div>
    {/* Highlighted Post Content */}
    <p className="text-gray-900 mb-3 leading-relaxed text-[15px]">
      {highlightQuery(post.content, searchQuery)}
    </p>

    {/* Post Tags */}
    {post.tags && post.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default PostContent;
