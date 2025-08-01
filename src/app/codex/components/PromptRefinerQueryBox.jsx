import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const PromptRefinerQueryBox = ({ 
  onFinalPrompt, 
  disabled = false,
  loading = false 
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [duration, setDuration] = useState('');
  const [conversation, setConversation] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isRefining, setIsRefining] = useState(false);
  const [isRefinementComplete, setIsRefinementComplete] = useState(false);
  const [finalRoadmapPrompt, setFinalRoadmapPrompt] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const callInitiatePrompt = async (userInput, history = []) => {
    const response = await fetch('https://bepro-initiator-prompt.onrender.com/initiate-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: userInput,
        history: history
      })
    });

    if (!response.ok) {
      throw new Error('Failed to communicate with Codex assistant');
    }

    return await response.json();
  };

  const handleInitialSubmit = async () => {
    if (!currentInput.trim() || !duration) {
      alert('Please enter a goal and select duration');
      return;
    }

    setIsRefining(true);
    const initialUserInput = `${currentInput} (Duration: ${duration})`;
    
    const userMessage = {
      type: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    };

    setConversation([userMessage]);
    
    try {
      const data = await callInitiatePrompt(initialUserInput, []);
      
      // Update conversation history for next call
      const newHistory = [
        { role: 'user', content: initialUserInput },
        { role: 'assistant', content: data.session }
      ];
      setConversationHistory(newHistory);
      
      if (data.end === "true") {
        // Refinement complete immediately
        setFinalRoadmapPrompt(data.session);
        setIsRefinementComplete(true);
        
        const finalMessage = {
          type: 'assistant',
          content: "Perfect! I've refined your roadmap prompt. You can now generate your personalized roadmap.",
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, finalMessage]);
      } else {
        // Continue conversation
        const assistantMessage = {
          type: 'assistant',
          content: data.session,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in prompt refinement:', error);
      alert('Failed to start prompt refinement. Please try again.');
    } finally {
      setIsRefining(false);
    }

    setCurrentInput('');
  };

  const handleContinueConversation = async () => {
    if (!currentInput.trim()) return;

    const userMessage = {
      type: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsRefining(true);

    try {
      const data = await callInitiatePrompt(currentInput, conversationHistory);
      
      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: currentInput },
        { role: 'assistant', content: data.session }
      ];
      setConversationHistory(newHistory);
      
      if (data.end === "true") {
        // Refinement complete
        setFinalRoadmapPrompt(data.session);
        setIsRefinementComplete(true);
        
        const finalMessage = {
          type: 'assistant',
          content: "Perfect! I've refined your roadmap prompt. You can now generate your personalized roadmap.",
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, finalMessage]);
      } else {
        // Continue conversation
        const assistantMessage = {
          type: 'assistant',
          content: data.session,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in conversation:', error);
      alert('Failed to continue conversation. Please try again.');
    } finally {
      setIsRefining(false);
    }

    setCurrentInput('');
  };

  const handleGenerateRoadmap = () => {
    onFinalPrompt(finalRoadmapPrompt, duration);
  };

  const resetConversation = () => {
    setConversation([]);
    setConversationHistory([]);
    setIsRefinementComplete(false);
    setFinalRoadmapPrompt('');
    setCurrentInput('');
    setDuration('');
  };

  if (conversation.length === 0) {
    // Initial prompt input
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      >
        <div className="p-8 lg:p-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What career goal would you like to achieve?
              </label>
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="e.g., I want to become a full-stack developer, or I want to transition into data science..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all duration-300 resize-none font-mono text-gray-800 placeholder-gray-400"
                rows={4}
                disabled={disabled || isRefining}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Timeline
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all duration-300 font-mono text-gray-800"
                disabled={disabled || isRefining}
              >
                <option value="">Select timeline</option>
                <option value="1 month">1 Month</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
                <option value="1 year">1 Year</option>
                <option value="2 years">2 Years</option>
              </select>
            </div>

            <button
              onClick={handleInitialSubmit}
              disabled={disabled || isRefining || !currentInput.trim() || !duration}
              className="w-full px-6 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-xl font-black text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isRefining ? (
                <>
                  <div className="w-5 h-5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin"></div>
                  Refining Your Goal...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.172-.266l-4.244 1.082a.75.75 0 01-.896-.896l1.082-4.244A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  Start Roadmap Planning
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Conversation interface - Made significantly bigger
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
          <h3 className="font-black text-lg">Codex Assistant</h3>
        </div>
        <button
          onClick={resetConversation}
          className="text-amber-300 hover:text-amber-200 transition-colors"
          title="Start Over"
          disabled={isRefining || loading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Chat area */}
      <div className="h-[450px] overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {conversation.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900'
                    : 'bg-gray-50 text-gray-800 border-l-4 border-amber-400'
                }`}
              >
                {message.type === 'user' ? (
                  <p className="text-base leading-relaxed text-left whitespace-pre-wrap font-medium">
                    {message.content}
                  </p>
                ) : (
                  <div className="text-base leading-relaxed text-left">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isRefining && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-50 p-4 rounded-2xl border-l-4 border-amber-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="ml-2 text-gray-600 text-sm font-medium">Codex is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 border-t border-gray-200">
        {isRefinementComplete ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 font-semibold">Roadmap prompt ready!</p>
              </div>
            </div>
            
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-black text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Generate My Roadmap
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isRefining) {
                  e.preventDefault();
                  handleContinueConversation();
                }
              }}
              placeholder="Type your response... (Shift+Enter for new line)"
              className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400"
              disabled={isRefining || loading}
            />
            <button
              onClick={handleContinueConversation}
              disabled={isRefining || loading || !currentInput.trim()}
              className="px-6 py-4 bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 rounded-xl font-black hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefining ? (
                <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PromptRefinerQueryBox;