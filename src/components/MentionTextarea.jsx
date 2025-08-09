'use client'

import { forwardRef } from 'react'
import useMentionInput from '../hooks/useMentionInput'
import UserMentionAutocomplete from './UserMentionAutocomplete'

const MentionTextarea = forwardRef(({ 
  value, 
  onChange, 
  placeholder = "Type your message...",
  className = "",
  rows = 3,
  disabled = false,
  ...props 
}, ref) => {
  const {
    text,
    setText,
    mentionState,
    insertMention,
    hideMentions,
    inputRef
  } = useMentionInput(value, onChange)

  // Sync external value changes
  if (value !== text) {
    setText(value)
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full resize-none ${className}`}
        {...props}
      />
      
      <UserMentionAutocomplete
        inputRef={inputRef}
        isVisible={mentionState.isVisible}
        searchQuery={mentionState.query}
        onMention={insertMention}
        onHide={hideMentions}
      />
    </div>
  )
})

MentionTextarea.displayName = 'MentionTextarea'

export default MentionTextarea