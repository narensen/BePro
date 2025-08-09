import React, { useState } from "react";
import { Brain, AlertTriangle } from "lucide-react";

function AIMentorFeedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div className="mt-4 animate-fade-in-down">
      <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/30 min-w-48 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-amber-400 mb-1">Codex Mentor</p>
            <p className="text-xs sm:text-sm leading-tight break-words">{feedback.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AICodexMentor() {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const response = await fetch(`https://bepro-mentor.onrender.com/mentor?input=${encodeURIComponent(input)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail || `Server responded with status: ${response.status}`;
        throw new Error(detail);
      }
      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError(err.message || "Failed to process Codex response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 p-6 bg-white/90 rounded-2xl border border-yellow-200 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Ask the AI Mentor</h2>
      <p className="text-gray-700 text-center text-sm mb-2">Get instant feedback, code review, or advice from the Fortress AI Mentor. Paste code or ask a question below.</p>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your code or question here..."
        className="w-full h-28 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-gray-900 font-mono text-sm resize-none outline-none placeholder-gray-400"
        spellCheck={false}
      />
      <button
        onClick={handleAsk}
        disabled={isLoading || !input.trim()}
        className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold shadow hover:bg-yellow-500 transition-all disabled:opacity-60"
      >
        {isLoading ? "Thinking..." : "Ask Mentor"}
      </button>
      {feedback && <AIMentorFeedback feedback={feedback} />}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20 mt-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-bold break-words">{error}</span>
        </div>
      )}
    </div>
  );
}
