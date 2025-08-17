import React from 'react';
import { highlightQuery } from '../utils/highlightQuery';

const PostContent = ({ post, searchQuery }) => {
  const renderContentWithBreaks = (content) => {
    if (!content) return '';
    
    const paragraphs = content.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, index) => {
      const lines = paragraph.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) return null;
      
      return (
        <div key={index} className="mb-6">
          {lines.map((line, lineIndex) => (
            <div key={lineIndex} className="text-gray-900 text-base leading-relaxed mb-2">
              {highlightQuery(line, searchQuery)}
            </div>
          ))}
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        {renderContentWithBreaks(post.content)}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-gray-400 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-500 transition-all duration-200 cursor-pointer transform hover:scale-105"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostContent;