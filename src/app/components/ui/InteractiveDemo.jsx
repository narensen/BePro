'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertTriangle } from 'lucide-react';

const AIMentorFeedback = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 animate-fade-in-down">
      <div className="relative">
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent border-t-gray-900"></div>
        <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/30 min-w-64 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">AI Mentor</p>
              <p className="text-sm leading-tight">{feedback.message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InteractiveDemo = () => {
  const [code, setCode] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Stop polling if there's no code
    if (!code.trim()) {
      setCurrentFeedback(null);
      setError(null);
      return;
    }

    const fetchFeedback = async () => {
      try {
        const response = await fetch(`/mentor?input=${encodeURIComponent(code)}`);
        
        // This checks for server errors (like 500, 404 etc.)
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // This will fail if the server sends back something that isn't valid JSON
        const data = await response.json();
        setCurrentFeedback(data);
        setError(null); // Clear any previous errors on success

      } catch (err) {
        console.error("AI Mentor request failed:", err);
        setError("Failed to process AI Mentor response. Please try again.");
        setCurrentFeedback(null);
      }
    };

    // Initial call so you don't have to wait 3.5s for the first feedback
    fetchFeedback(); 

    const intervalId = setInterval(fetchFeedback, 3500);

    // Cleanup function to stop the interval when the component is removed
    return () => clearInterval(intervalId);

  }, [code]); // The effect re-runs if the 'code' in the textarea changes

  return (
    <div className="relative">
      <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </div>
          <span className="ml-4 text-gray-400 text-sm font-mono">main.js - AI Mentor Active</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Start typing JavaScript code here..."
            className="w-full h-48 bg-transparent text-green-400 font-mono text-sm resize-none outline-none placeholder-gray-500/70 leading-relaxed"
            spellCheck={false}
          />
          
          {currentFeedback && <AIMentorFeedback feedback={currentFeedback} />}
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-amber-400 text-sm font-bold">AI Mentor</p>
              <p className="text-gray-400 text-xs">Continuously Watching</p>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400">
               <AlertTriangle className="w-4 h-4"/>
               <span className="text-xs font-bold">{error}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};