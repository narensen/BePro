'use client'

import DateSeparator from './DateSeparator';
import { groupMessagesByDate, formatTime } from '../utils/dateUtils';
import { useEffect } from 'react';

export default function MessagesList({ messages, username, messagesEndRef, activeConversation, markMessagesAsRead }) {
  const messageGroups = groupMessagesByDate(messages);
  useEffect(() => {
    if (messages.length > 0 && activeConversation && username) {

      const timer = setTimeout(() => {
        markMessagesAsRead(activeConversation.conversationId, activeConversation.otherUsername);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, activeConversation, username, markMessagesAsRead]);
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="space-y-2">
        {messageGroups.map((group, groupIndex) => (
          <div key={group.dateKey}>
            <DateSeparator dateLabel={group.dateLabel} />
            <div className="space-y-3">
              {group.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderUsername === username ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.senderUsername === username
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    <div className="break-words leading-relaxed">{message.content}</div>
                    <div className={`text-xs mt-2 text-right ${
                      message.senderUsername === username ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                      {message.senderUsername === username && (
                        <span className="ml-2">
                          {message.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}