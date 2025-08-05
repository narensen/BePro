'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertTriangle } from 'lucide-react';
const AIMentorFeedback = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 animate-fade-in-down">
      <div className="relative">
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent border-t-gray-900"></div>
        <div className="bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-2xl border border-amber-400/30 min-w-48 sm:min-w-64 backdrop-blur-xl">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-amber-400 mb-1">Codex</p>
              <p className="text-xs sm:text-sm leading-tight break-words">{feedback.message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResponsiveInteractiveDemo() {
  const [code, setCode] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!code.trim()) {
      setCurrentFeedback(null);
      setError(null);
      return;
    }

    setIsLoading(true);

    const handler = setTimeout(() => {
      const fetchFeedback = async () => {
        try {
          const response = await fetch(`https://bepro-mentor.onrender.com/mentor?input=${encodeURIComponent(code)}`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const detail = errorData?.detail || `Server responded with status: ${response.status}`;
            throw new Error(detail);
          }
          
          const data = await response.json();
          setCurrentFeedback(data);
          setError(null);

        } catch (err) {
          console.error("Codex request failed:", err);
          setError(err.message || "Failed to process Codex response. Please try again.");
          setCurrentFeedback(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchFeedback();
    }, 1000);

    return () => {
      clearTimeout(handler);
      setIsLoading(false);
    };

  }, [code]);

  return (
    <div className="relative w-full">
      <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-700/50 backdrop-blur-xl">
        {}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
          </div>
          <span className="ml-2 sm:ml-4 text-gray-400 text-xs sm:text-sm font-mono">main.js - Codex Active</span>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className={`text-xs font-medium ${isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
              {isLoading ? 'Thinking...' : 'Live'}
            </span>
          </div>
        </div>
        
        {}
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Start typing JavaScript code here..."
            className="w-full h-32 sm:h-40 lg:h-48 bg-transparent text-green-400 font-mono text-xs sm:text-sm resize-none outline-none placeholder-gray-500/70 leading-relaxed"
            spellCheck={false}
          />
          
          {currentFeedback && <AIMentorFeedback feedback={currentFeedback} />}
        </div>
        
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <p className="text-amber-400 text-sm font-bold">Codex</p>
              <p className="text-gray-400 text-xs">Continuously Watching</p>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
               <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
               <span className="text-xs font-bold break-words">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}