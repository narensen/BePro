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
            className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-amber-800 px-3 py-1 rounded-full text-xs font-bold hover:from-yellow-400/30 hover:to-orange-400/30 transition-all duration-200 cursor-pointer border border-amber-300/30"
          >
            #{tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default PostContent;
