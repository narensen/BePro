'use client'

import React from 'react';
import Link from 'next/link';

const UserMention = ({ username, className = "", children }) => {
  const handleClick = (e) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();
  };

  return (
    <Link 
      href={`/${username}`}
      onClick={handleClick}
      className={`text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200 ${className}`}
    >
      @{username}
    </Link>
  );
};

// Utility function to parse content and replace mentions with clickable components
export const parseMentions = (content, searchQuery = '') => {
  if (!content) return content;

  // Regular expression to match @username mentions
  const mentionRegex = /@(\w+)/g;
  const parts = [];
  let lastIndex = 0;

  content.replace(mentionRegex, (match, username, offset) => {
    // Add text before mention
    if (offset > lastIndex) {
      const textBefore = content.slice(lastIndex, offset);
      parts.push(highlightSearchQuery(textBefore, searchQuery));
    }

    // Add mention component
    parts.push(
      <UserMention key={`mention-${offset}-${username}`} username={username}>
        {match}
      </UserMention>
    );

    lastIndex = offset + match.length;
    return match;
  });

  // Add remaining text after last mention
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    parts.push(highlightSearchQuery(textAfter, searchQuery));
  }

  return parts.length > 0 ? parts : content;
};

// Helper function to highlight search query in text
const highlightSearchQuery = (text, searchQuery) => {
  if (!searchQuery || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <span
          key={`highlight-${index}`}
          className="bg-yellow-200 font-semibold"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

// Helper function to escape special regex characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default UserMention;