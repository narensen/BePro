'use client'

import { useState, useCallback, useRef } from 'react'

export const useMentionInput = (initialValue = '', onTextChange) => {
  const [text, setText] = useState(initialValue)
  const [mentionState, setMentionState] = useState({
    isVisible: false,
    query: '',
    startIndex: -1,
    endIndex: -1
  })
  const inputRef = useRef(null)

  const handleTextChange = useCallback((value) => {
    setText(value)
    onTextChange?.(value)

    // Check for @ mentions
    const input = inputRef.current
    if (!input) return

    const cursorPosition = input.selectionStart
    const textUpToCursor = value.substring(0, cursorPosition)
    
    // Find the last @ symbol before cursor
    const lastAtIndex = textUpToCursor.lastIndexOf('@')
    
    if (lastAtIndex === -1) {
      // No @ symbol found, hide autocomplete
      setMentionState(prev => ({ ...prev, isVisible: false }))
      return
    }

    // Check if @ is at start or preceded by whitespace
    const charBeforeAt = lastAtIndex > 0 ? textUpToCursor[lastAtIndex - 1] : ' '
    if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) {
      setMentionState(prev => ({ ...prev, isVisible: false }))
      return
    }

    // Get text after @
    const textAfterAt = textUpToCursor.substring(lastAtIndex + 1)
    
    // Check if there's a space in the text after @ (which would end the mention)
    if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
      setMentionState(prev => ({ ...prev, isVisible: false }))
      return
    }

    // Show autocomplete with search query
    setMentionState({
      isVisible: true,
      query: textAfterAt,
      startIndex: lastAtIndex,
      endIndex: cursorPosition
    })
  }, [onTextChange])

  const insertMention = useCallback((user) => {
    if (!mentionState.isVisible) return

    const beforeMention = text.substring(0, mentionState.startIndex)
    const afterMention = text.substring(mentionState.endIndex)
    const mentionText = `@${user.username} `
    
    const newText = beforeMention + mentionText + afterMention
    const newCursorPosition = mentionState.startIndex + mentionText.length

    setText(newText)
    onTextChange?.(newText)
    
    // Hide autocomplete
    setMentionState(prev => ({ ...prev, isVisible: false }))

    // Set cursor position after the mention
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
        inputRef.current.focus()
      }
    }, 0)
  }, [text, mentionState, onTextChange])

  const hideMentions = useCallback(() => {
    setMentionState(prev => ({ ...prev, isVisible: false }))
  }, [])

  return {
    text,
    setText: handleTextChange,
    mentionState,
    insertMention,
    hideMentions,
    inputRef
  }
}

export default useMentionInput