import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

const ChatArea = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-yellow-400/10 via-amber-400/10 to-orange-400/10">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-amber-400/30 rounded-xl p-4 lg:p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-400"></div>
              <span className="text-amber-300 font-medium">Codex is thinking...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatArea;