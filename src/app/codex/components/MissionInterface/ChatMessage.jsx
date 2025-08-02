import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Play, AlertTriangle } from 'lucide-react';
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
        <code className="bg-gray-800 text-amber-300 px-1 rounded text-sm" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-amber-300">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-amber-200">{children}</h2>,
    h3: ({ children }) => <h3 className="text-md font-bold mb-2 text-amber-200">{children}</h3>,
    p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="ml-2">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-amber-500 pl-4 italic bg-amber-50/10 py-2 mb-2 rounded-r">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
    em: ({ children }) => <em className="italic text-amber-200">{children}</em>,
  };

  const getMessageStyles = () => {
    switch (message.type) {
      case 'user':
        return 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg';
      case 'error':
        return 'bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 text-red-200';
      case 'system':
        return 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-green-200';
      default:
        return 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-amber-400/30 text-amber-100';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'system':
        return <Play size={16} className="text-green-400 flex-shrink-0" />;
      case 'assistant':
        return <MessageCircle size={16} className="text-amber-400 flex-shrink-0" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />;
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
      <div className={`max-w-[80%] rounded-xl p-4 lg:p-6 ${getMessageStyles()} shadow-lg`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            {message.type === 'user' ? (
              <p className="whitespace-pre-wrap break-words font-medium">{message.content}</p>
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