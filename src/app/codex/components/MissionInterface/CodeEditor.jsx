import React from 'react';
import { Code, Copy } from 'lucide-react';

const CodeEditor = ({ 
  showCodeEditor, 
  setShowCodeEditor, 
  codeInput, 
  setCodeInput, 
  setCurrentInput 
}) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeInput);
    // You could add a toast notification here
    alert('Code copied to clipboard!');
  };

  const handleSendToChat = () => {
    setCurrentInput(`Here's my code:\n\`\`\`\n${codeInput}\n\`\`\`\n\nCan you review this and provide feedback?`);
  };

  if (!showCodeEditor) return null;

  return (
    <div className="border-t border-amber-400/30 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-600/20 rounded-lg">
            <Code size={16} className="text-amber-400" />
          </div>
          <span className="text-lg font-black text-amber-300">IDE Workspace</span>
        </div>
        <button
          onClick={() => setShowCodeEditor(false)}
          className="text-amber-200 hover:text-amber-100 text-sm font-bold px-3 py-1 rounded-lg hover:bg-amber-600/20 transition-all duration-300"
        >
          Hide
        </button>
      </div>
      
      <textarea
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value)}
        className="w-full h-40 bg-black/80 text-green-400 font-mono text-sm p-4 rounded-xl border border-amber-400/30 focus:border-amber-500 focus:outline-none resize-none shadow-inner"
        placeholder="// Your code here..."
        spellCheck={false}
      />
      
      <div className="flex justify-end mt-4 space-x-3">
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 px-4 py-2 bg-amber-200/20 hover:bg-amber-200/30 text-amber-200 text-sm rounded-lg transition-all duration-300 border border-amber-400/30 hover:scale-105 font-medium"
        >
          <Copy size={14} />
          Copy
        </button>
        <button
          onClick={handleSendToChat}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 font-bold shadow-lg"
        >
          <Code size={14} />
          Send to Chat
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;