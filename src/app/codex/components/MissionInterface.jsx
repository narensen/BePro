import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Code, MessageCircle, ArrowLeft, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '../../lib/supabase_client';

const MissionInterface = ({ 
  missionNumber, 
  missionTitle, 
  missionDescription, 
  username, 
  onBackToCodex,
  onMissionComplete 
}) => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  // Load existing session messages for this mission
  useEffect(() => {
    const loadMissionSession = async () => {
      try {
        // Get existing session from Supabase
        const { data, error } = await supabase
          .from('codex')
          .select('session')
          .eq('username', username)
          .single();

        if (data && data.session) {
          const missionSessionKey = `mission_${missionNumber}`;
          const existingSession = data.session[missionSessionKey] || [];
          
          if (existingSession.length > 0) {
            setMessages(existingSession);
          } else {
            // Start with welcome message if no existing session
            const welcomeMessage = {
              id: Date.now(),
              type: 'system',
              content: `🚀 Welcome to Mission ${missionNumber}: ${missionTitle}\n\nI'm here to guide you through this mission. Feel free to ask questions, request explanations, or share your code for review. Let's start your learning journey!`,
              timestamp: new Date().toISOString()
            };
            setMessages([welcomeMessage]);
          }
        }
        setSessionLoaded(true);
      } catch (error) {
        console.error('Error loading mission session:', error);
        setSessionLoaded(true);
      }
    };

    loadMissionSession();
  }, [missionNumber, missionTitle, username]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save session to Supabase
  const saveMissionSession = async (newMessages) => {
    try {
      // Get current session data
      const { data, error: fetchError } = await supabase
        .from('codex')
        .select('session')
        .eq('username', username)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching session:', fetchError);
        return;
      }

      const currentSession = data?.session || {};
      const missionSessionKey = `mission_${missionNumber}`;
      
      // Update the session for this specific mission
      const updatedSession = {
        ...currentSession,
        [missionSessionKey]: newMessages
      };

      // Save back to Supabase
      const { error: updateError } = await supabase
        .from('codex')
        .update({ session: updatedSession })
        .eq('username', username);

      if (updateError) {
        console.error('Error saving session:', updateError);
      }
    } catch (error) {
      console.error('Error in saveMissionSession:', error);
    }
  };

  // Handle automatic mission completion when LLM decides
  const handleAutoMissionComplete = async () => {
    try {
      // Get current roadmap data
      const { data, error: fetchError } = await supabase
        .from('codex')
        .select('active_status, roadmap')
        .eq('username', username)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return;
      }

      const currentActiveStatus = data?.active_status || 0;
      const newActiveStatus = currentActiveStatus + 1; // Increment to move to next mission
      
      // Update active_status in Supabase
      const { error: updateError } = await supabase
        .from('codex')
        .update({ active_status: newActiveStatus })
        .eq('username', username);

      if (updateError) {
        console.error('Error updating active status:', updateError);
        return;
      }

      // Add completion message to session
      const completionMessage = {
        id: Date.now(),
        type: 'system',
        content: `🎉 Congratulations! You have successfully completed Mission ${missionNumber}: ${missionTitle}!\n\nBased on your progress, I've determined you're ready to move on to the next challenge. Keep up the great work!`,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...messages, completionMessage];
      setMessages(finalMessages);
      await saveMissionSession(finalMessages);
      
      // Call the completion callback
      setTimeout(() => {
        onMissionComplete?.(missionNumber);
      }, 3000); // Give user time to read the completion message
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  // Updated handleSendMessage function with proper backend format
  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Prepare conversation history
      const recentMessages = messages.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      const conversationHistory = messages.length > 0 ? recentMessages : 'Starting new mission conversation';

      // Send in QueryMission format that backend expects
      const response = await fetch('https://bepro-mentor.onrender.com/codex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: currentInput,                    // User's actual question
          mission: `Mission ${missionNumber}: ${missionTitle} - ${missionDescription}`, // Mission context
          logs: `Mission ${missionNumber} logs`,  // Mission logs
          history: conversationHistory            // Conversation history
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if LLM decided to end the mission
        const shouldEndMission = data.end_mission === "true" || data.end_mission === true;
        
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: data.response || 'I apologize, but I encountered an issue processing your request.',
          timestamp: new Date().toISOString()
        };

        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);

        // Save session to Supabase
        await saveMissionSession(finalMessages);

        // If LLM decided to end the mission, handle completion
        if (shouldEndMission) {
          setTimeout(() => {
            handleAutoMissionComplete();
          }, 1000); // Small delay to let the user see the final response
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      await saveMissionSession(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Custom markdown components for beautiful rendering
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
    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-amber-700">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-amber-600">{children}</h2>,
    h3: ({ children }) => <h3 className="text-md font-bold mb-2 text-amber-500">{children}</h3>,
    p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="ml-2">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-amber-500 pl-4 italic bg-amber-50/10 py-2 mb-2 rounded-r">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-bold text-amber-600">{children}</strong>,
    em: ({ children }) => <em className="italic text-amber-600">{children}</em>,
  };

  if (!sessionLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800">Loading Mission {missionNumber}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-mono">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-orange-300/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToCodex}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-900 rounded-lg transition-colors border border-amber-600/30"
            >
              <ArrowLeft size={18} />
              <span>Back to Codex</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mission {missionNumber}</h1>
              <p className="text-amber-800 text-sm">{missionTitle}</p>
            </div>
          </div>
          <div className="text-sm text-amber-800 bg-amber-100/50 px-3 py-1 rounded-lg">
            🤖 Mission completion is determined by AI
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Mission Description Sidebar */}
        <div className="w-1/3 bg-black/10 backdrop-blur-sm border-r border-orange-300/30 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4 text-amber-800">Mission Brief</h2>
          <div className="prose prose-amber prose-sm">
            <ReactMarkdown components={markdownComponents}>
              {missionDescription}
            </ReactMarkdown>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 space-y-3">
            <h3 className="text-md font-semibold text-amber-800">Quick Actions</h3>
            <button
              onClick={() => setCurrentInput("Can you explain this mission in simple terms?")}
              className="w-full text-left px-3 py-2 bg-amber-100/30 hover:bg-amber-100/50 rounded border border-amber-300/50 transition-colors text-sm text-gray-800"
            >
              📚 Explain this mission
            </button>
            <button
              onClick={() => setCurrentInput("Can you give me a step-by-step approach?")}
              className="w-full text-left px-3 py-2 bg-amber-100/30 hover:bg-amber-100/50 rounded border border-amber-300/50 transition-colors text-sm text-gray-800"
            >
              📋 Step-by-step guide
            </button>
            <button
              onClick={() => setCurrentInput("Can you provide a code example?")}
              className="w-full text-left px-3 py-2 bg-amber-100/30 hover:bg-amber-100/50 rounded border border-amber-300/50 transition-colors text-sm text-gray-800"
            >
              💻 Show code example
            </button>
            <button
              onClick={() => setCurrentInput("I need help understanding this concept")}
              className="w-full text-left px-3 py-2 bg-amber-100/30 hover:bg-amber-100/50 rounded border border-amber-300/50 transition-colors text-sm text-gray-800"
            >
              🤔 I need help
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-amber-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 border border-red-300 text-red-800'
                      : message.type === 'system'
                      ? 'bg-green-100 border border-green-300 text-green-800'
                      : 'bg-white/90 backdrop-blur-sm border border-amber-300/50 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'system' && (
                      <Play size={16} className="mt-1 text-green-600 flex-shrink-0" />
                    )}
                    {message.type === 'assistant' && (
                      <MessageCircle size={16} className="mt-1 text-amber-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {message.type === 'user' ? (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown components={markdownComponents}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      <div className="mt-2 text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 backdrop-blur-sm border border-amber-300/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                    <span className="text-gray-700">Codex is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Code Editor (conditionally shown) */}
          {showCodeEditor && (
            <div className="border-t border-amber-300/30 bg-black/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Code size={16} className="text-amber-700" />
                  <span className="text-sm font-semibold text-amber-800">IDE Workspace</span>
                </div>
                <button
                  onClick={() => setShowCodeEditor(false)}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Hide
                </button>
              </div>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="w-full h-32 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded border border-amber-400/50 focus:border-amber-500 focus:outline-none resize-none"
                placeholder="// Your code here..."
                spellCheck={false}
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeInput);
                    alert('Code copied to clipboard!');
                  }}
                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs rounded transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => setCurrentInput(`Here's my code:\n\`\`\`\n${codeInput}\n\`\`\`\n\nCan you review this and provide feedback?`)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded transition-colors"
                >
                  Send to Chat
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-amber-300/30 bg-black/10 p-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-white/80 backdrop-blur-sm border border-amber-300/50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Ask a question, request help, or share your code..."
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isLoading}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send size={18} />
                <span>Send</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Press Enter to send • Shift+Enter for new line • AI will determine when mission is complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionInterface;