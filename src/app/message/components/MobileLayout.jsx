'use client'

import ConversationsList from './ConversationsList'
import ChatArea from './ChatArea'

export default function MobileLayout({ showConversationsList, markMessagesAsRead, ...props }) {
  return (
    <div className="lg:hidden h-screen flex flex-col pt-16">
      {/* Conversations List - Mobile Only */}
      <div className={`${
        showConversationsList ? 'flex' : 'hidden'
      } w-full bg-white/95 backdrop-blur-sm border-r border-gray-200 flex-col flex-1`}>
        <ConversationsList {...props} markMessagesAsRead={markMessagesAsRead} />
      </div>

      {/* Chat Area - Mobile Only */}
      <div className={`${
        !showConversationsList && props.activeConversation ? 'flex' : 'hidden'
      } flex-1 flex-col`}>
        <ChatArea 
          {...props}
          markMessagesAsRead={props.markMessagesAsRead}
        />
      </div>
    </div>
  )
}