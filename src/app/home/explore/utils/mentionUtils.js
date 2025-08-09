import React from 'react';
import UserMention from '../components/UserMention';

export const parseMentions = (text) => {
  if (!text) return text;
  
  const mentionRegex = /@(\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the mention component
    parts.push(
      <UserMention 
        key={`mention-${match.index}-${match[1]}`} 
        username={match[1]} 
      />
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last mention
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
};