import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatMessage = ({ message }) => {
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
        <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-gray-800">{children}</h2>,
    h3: ({ children }) => <h3 className="text-md font-bold mb-2 text-gray-800">{children}</h3>,
    p: ({ children }) => <p className="mb-2 leading-relaxed text-gray-700">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-700">{children}</ol>,
    li: ({ children }) => <li className="ml-2">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-500 pl-4 italic bg-gray-50 py-2 mb-2 rounded-r">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
  };

  const getMessageStyles = () => {
    switch (message.type) {
      case 'user':
        return 'bg-gradient-to-r from-gray-200 to-gray-600 text-gray-900 shadow-lg ml-auto';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 shadow-md';
      case 'system':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 shadow-md';
      default:
        return 'bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-800 shadow-lg';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'system':
        return <CheckCircle size={16} className="text-green-600 flex-shrink-0" />;
      case 'assistant':
        return <MessageCircle size={16} className="text-gray-600 flex-shrink-0" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] rounded-2xl p-4 lg:p-6 ${getMessageStyles()}`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            {message.type === 'user' ? (
              <p className="whitespace-pre-wrap break-words font-medium leading-relaxed">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            <div className="mt-3 text-xs opacity-70 font-medium">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;