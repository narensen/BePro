import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X } from 'lucide-react';

const MissionSidebar = ({ 
  missionDescription, 
  setCurrentInput, 
  showSidebar, 
  setShowSidebar 
}) => {
  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline && language ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={language}
          PreTag="div"
          className="rounded-lg !mt-2 !mb-2"
          customStyle={{
            backgroundColor: '#1a1a1a',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-800 text-amber-300 px-1 rounded text-sm" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-amber-300">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-amber-200">{children}</h2>,
    h3: ({ children }) => <h3 className="text-md font-bold mb-2 text-amber-200">{children}</h3>,
    p: ({ children }) => <p className="mb-2 leading-relaxed text-amber-100">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-amber-100">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-amber-100">{children}</ol>,
    li: ({ children }) => <li className="ml-2">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-amber-500 pl-4 italic bg-amber-50/10 py-2 mb-2 rounded-r">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
    em: ({ children }) => <em className="italic text-amber-200">{children}</em>,
  };

  const quickActions = [
    {
      text: "Can you explain this mission in simple terms?",
      icon: "📚",
      label: "Explain this mission"
    },
    {
      text: "Can you give me a step-by-step approach?",
      icon: "📋",
      label: "Step-by-step guide"
    },
    {
      text: "Can you provide a code example?",
      icon: "💻",
      label: "Show code example"
    },
    {
      text: "I need help understanding this concept",
      icon: "🤔",
      label: "I need help"
    }
  ];

  if (!showSidebar) return null;

  return (
    <div className="w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-r border-amber-400/30 overflow-y-auto shadow-xl min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-black text-amber-300 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Mission Brief
          </h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 hover:bg-amber-600/20 rounded-lg transition-colors text-amber-300"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="prose prose-amber prose-sm mb-6">
          <div className="bg-black/20 rounded-xl p-4 border border-amber-400/20">
            <ReactMarkdown components={markdownComponents}>
              {missionDescription}
            </ReactMarkdown>
          </div>
        </div>
        
        {}
        <div className="space-y-3">
          <h3 className="text-md font-black text-amber-300 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            Quick Actions
          </h3>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setCurrentInput(action.text)}
              className="w-full text-left px-4 py-3 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 hover:from-amber-600/30 hover:to-yellow-600/30 rounded-xl border border-amber-400/30 transition-all duration-300 text-sm text-amber-100 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{action.icon}</span>
                <span className="font-medium">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionSidebar;