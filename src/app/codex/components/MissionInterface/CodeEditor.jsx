import React from 'react';
import { Code, Copy, X } from 'lucide-react';

const CodeEditor = ({ 
  showCodeEditor, 
  setShowCodeEditor, 
  codeInput, 
  setCodeInput, 
  setCurrentInput 
}) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeInput);
    // Simple feedback - you could enhance this with a toast
    const button = document.activeElement;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 1000);
  };

  const handleSendToChat = () => {
    setCurrentInput(`Here's my code:\n\`\`\`\n${codeInput}\n\`\`\`\n\nCan you review this and provide feedback?`);
  };

  if (!showCodeEditor) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50/95 backdrop-blur-sm p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
            <Code size={16} className="text-gray-900" />
          </div>
          <span className="text-lg font-black text-gray-900">Code Workspace</span>
        </div>
        <button
          onClick={() => setShowCodeEditor(false)}
          className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-200 rounded-lg transition-all duration-300"
        >
          <X size={18} />
        </button>
      </div>
      
      <textarea
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value)}
        className="w-full h-40 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-xl border border-gray-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none shadow-inner"
        placeholder="// Your code here..."
        spellCheck={false}
      />
      
      <div className="flex justify-end mt-4 space-x-3">
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-all duration-300 border border-gray-300 hover:scale-105 font-medium"
        >
          <Copy size={14} />
          Copy
        </button>
        <button
          onClick={handleSendToChat}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 text-sm rounded-lg transition-all duration-300 hover:scale-105 font-bold shadow-lg"
        >
          <Code size={14} />
          Send to Chat
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;