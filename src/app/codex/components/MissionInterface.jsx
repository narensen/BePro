import { useState, useEffect } from 'react';
import { Send, Play, Code, Brain, CheckCircle, Lock, ArrowRight } from 'lucide-react';

export default function MissionInterface({ missions, username, currentMissionId = "1" }) {
  const [selectedMission, setSelectedMission] = useState(currentMissionId);
  const [queryInput, setQueryInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [mentorFeedback, setMentorFeedback] = useState('');
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [sessionLogs, setSessionLogs] = useState('');
  const [completionStatus, setCompletionStatus] = useState({});

  // Load completion status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`codex_completion_${username}`);
    if (saved) {
      setCompletionStatus(JSON.parse(saved));
    }
  }, [username]);

  // Save completion status to localStorage
  const saveCompletionStatus = (status) => {
    setCompletionStatus(status);
    localStorage.setItem(`codex_completion_${username}`, JSON.stringify(status));
  };

  // Check if mission is unlocked
  const isMissionUnlocked = (missionId) => {
    if (missionId === "1") return true; // First mission is always unlocked
    const prevMissionId = String(parseInt(missionId) - 1);
    return completionStatus[prevMissionId] === 'completed';
  };

  // Mark mission as completed
  const completeMission = (missionId) => {
    const newStatus = { ...completionStatus, [missionId]: 'completed' };
    saveCompletionStatus(newStatus);
  };

  // Handle query submission
  const handleQuerySubmit = async () => {
    if (!queryInput.trim() && !sessionLogs) {
      // If no input, ask LLM to teach next topic
      setQueryInput("Please teach me the next topic in this mission.");
    }

    setIsQueryLoading(true);
    try {
      const payload = {
        contents: queryInput || "Please teach me the next topic in this mission.",
        context: sessionLogs
      };

      const response = await fetch(`https://bepro-codex.onrender.com/query?username=${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.text();
        setQueryResponse(data);
        
        // Extract logs if present
        const logsMatch = data.match(/<LOGS>(.*?)<\/LOGS>/s);
        if (logsMatch) {
          setSessionLogs(prev => prev + '\n' + logsMatch[1].trim());
        }
      } else {
        setQueryResponse('Error: Failed to get response from Codex');
      }
    } catch (error) {
      setQueryResponse('Error: Network error occurred');
    } finally {
      setIsQueryLoading(false);
      setQueryInput('');
    }
  };

  // Handle mentor feedback (debounced)
  useEffect(() => {
    if (!codeInput.trim()) {
      setMentorFeedback('');
      return;
    }

    setIsMentorLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`https://bepro-mentor.onrender.com/mentor?input=${encodeURIComponent(codeInput)}`);
        if (response.ok) {
          const data = await response.json();
          setMentorFeedback(data.message);
        }
      } catch (error) {
        setMentorFeedback('Error getting feedback');
      } finally {
        setIsMentorLoading(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      setIsMentorLoading(false);
    };
  }, [codeInput]);

  const currentMission = missions[selectedMission];

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
      {/* Mission Selector */}
      <div className="bg-black/90 text-amber-300 p-4 border-b border-amber-400/30">
        <div className="flex items-center gap-4 overflow-x-auto">
          {Object.entries(missions).map(([id, mission]) => {
            const isUnlocked = isMissionUnlocked(id);
            const isCompleted = completionStatus[id] === 'completed';
            const isCurrent = selectedMission === id;
            
            return (
              <button
                key={id}
                onClick={() => isUnlocked && setSelectedMission(id)}
                disabled={!isUnlocked}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-amber-400 text-black'
                    : isCompleted
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : isUnlocked
                    ? 'bg-gray-700 text-amber-300 hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={16} />
                ) : !isUnlocked ? (
                  <Lock size={16} />
                ) : (
                  <span className="w-4 h-4 bg-amber-400 rounded-full" />
                )}
                Mission {id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Query/Teaching */}
        <div className="w-1/2 p-4 flex flex-col">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col h-full text-white">
          {/* Mission Title */}
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-black text-white mb-3">
              {currentMission?.title || `Mission ${selectedMission}`}
            </h2>
            <p className="text-white/80 leading-relaxed">
              {currentMission?.content || 'Mission content loading...'}
            </p>
          </div>

          {/* Query Response Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-amber-300" />
                <span className="font-bold text-amber-300 text-lg">Codex Response</span>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 min-h-[200px] border border-white/10">
                {isQueryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="ml-3 text-white/80 text-lg">Codex is thinking...</span>
                  </div>
                ) : queryResponse ? (
                  <div className="text-white leading-relaxed whitespace-pre-wrap">
                    {queryResponse.replace(/<SESSION>|<\/SESSION>|<LOGS>.*?<\/LOGS>/gs, '').trim()}
                  </div>
                ) : (
                  <div className="text-white/60 italic">
                    Ask Codex a question or click "Next Topic" to continue learning...
                  </div>
                )}
              </div>
            </div>

            {/* Session Logs */}
            {sessionLogs && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="font-bold text-green-300">Progress Logs</span>
                </div>
                <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
                  <div className="text-green-100 text-sm leading-relaxed whitespace-pre-wrap">
                    {sessionLogs}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Query Input */}
          <div className="p-6 border-t border-white/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask Codex anything about this mission..."
                className="flex-1 px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
                onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
              />
              <button
                onClick={handleQuerySubmit}
                disabled={isQueryLoading}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center gap-2 border border-white/20"
              >
                {queryInput.trim() ? <Send size={16} /> : <ArrowRight size={16} />}
                {queryInput.trim() ? 'Ask' : 'Next Topic'}
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* Right Side - Code IDE */}
        <div className="w-1/2 p-4 flex flex-col">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col h-full">
          {/* IDE Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-white/70 font-mono">mission_{selectedMission}.js</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-white/70" />
                <span className="text-white/70">Practice Arena</span>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative p-6">
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="// Write your code here to practice what you've learned..."
              className="w-full h-full bg-black/20 backdrop-blur-sm rounded-xl p-4 text-green-300 font-mono resize-none outline-none placeholder-white/40 leading-relaxed border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20"
              spellCheck={false}
            />
          </div>

          {/* Mentor Feedback */}
          <div className="p-6 border-t border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-blue-300" />
              <span className="font-bold text-blue-300">AI Mentor</span>
              {isMentorLoading && (
                <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin"></div>
              )}
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 min-h-[80px] border border-white/10">
              {mentorFeedback ? (
                <p className="text-blue-100 leading-relaxed">{mentorFeedback}</p>
              ) : (
                <p className="text-white/50 italic">
                  {isMentorLoading ? 'Analyzing your code...' : 'Start coding to get real-time feedback...'}
                </p>
              )}
            </div>
          </div>

          {/* Mission Completion */}
          <div className="p-6 border-t border-white/20">
            <button
              onClick={() => completeMission(selectedMission)}
              className="w-full py-4 bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-sm text-white rounded-xl font-bold hover:from-green-400/90 hover:to-emerald-400/90 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 border border-green-400/30"
            >
              <CheckCircle size={16} />
              Complete Mission {selectedMission}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}