import React from 'react';
import { Send, Code } from 'lucide-react';

const ChatInput = ({ 
  currentInput, 
  setCurrentInput, 
  handleSendMessage, 
  isLoading,
  showCodeEditor,
  setShowCodeEditor
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex mobile:flex-col mobile:space-x-0 mobile:space-y-3 space-x-4 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="touch-target w-full border border-gray-300 rounded-xl mobile:px-3 mobile:py-3 px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none font-medium shadow-sm bg-white mobile:text-base"
            placeholder="Ask a question, request help, or share your code..."
            rows={3}
            disabled={isLoading}
            style={{ minHeight: '44px' }} // Ensure touch target
          />
        </div>
        <div className="flex mobile:flex-row mobile:space-x-3 mobile:space-y-0 flex-col space-y-2">
          <button
            onClick={() => setShowCodeEditor(!showCodeEditor)}
            className={`touch-target mobile:flex-1 mobile:px-3 mobile:py-3 px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-bold shadow-md hover:scale-105 active:scale-95 ${
              showCodeEditor 
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-amber-300' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400'
            }`}
          >
            <Code size={16} />
            <span className="mobile:inline hidden lg:inline">Code</span>
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isLoading}
            className="touch-target mobile:flex-1 mobile:px-4 mobile:py-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-gray-900 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 disabled:hover:scale-100 active:scale-95 font-bold shadow-lg"
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </div>
      </div>
      <p className="mobile:text-xs text-xs text-gray-600 mobile:mt-2 mt-3 font-medium text-center max-w-4xl mx-auto">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;