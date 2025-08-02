import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ 
  currentInput, 
  setCurrentInput, 
  handleSendMessage, 
  isLoading 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-amber-400/30 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 lg:p-6">
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-black/80 border border-amber-400/30 rounded-xl px-4 py-3 text-amber-100 placeholder-amber-300/50 focus:outline-none focus:border-amber-500 resize-none font-medium shadow-inner"
            placeholder="Ask a question, request help, or share your code..."
            rows={3}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!currentInput.trim() || isLoading}
          className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 flex items-center space-x-2 hover:scale-105 disabled:hover:scale-100 font-bold shadow-lg"
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>
      <p className="text-xs text-amber-200/70 mt-3 font-medium">
        Press Enter to send • Shift+Enter for new line • AI will determine when mission is complete
      </p>
    </div>
  );
};

export default ChatInput;