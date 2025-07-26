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
        <div className="w-1/2 bg-black/95 text-amber-300 flex flex-col">
          {/* Mission Title */}
          <div className="p-4 border-b border-amber-400/30">
            <h2 className="text-xl font-black text-amber-400 mb-2">
              {currentMission?.title || `Mission ${selectedMission}`}
            </h2>
            <p className="text-sm text-amber-200 leading-relaxed">
              {currentMission?.content || 'Mission content loading...'}
            </p>
          </div>

          {/* Query Response Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-amber-400">Codex Response</span>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 min-h-[200px] border border-amber-400/20">
                {isQueryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                    <span className="ml-2 text-amber-200">Codex is thinking...</span>
                  </div>
                ) : queryResponse ? (
                  <div className="text-amber-100 text-sm leading-relaxed whitespace-pre-wrap">
                    {queryResponse.replace(/<SESSION>|<\/SESSION>|<LOGS>.*?<\/LOGS>/gs, '').trim()}
                  </div>
                ) : (
                  <div className="text-amber-200/60 text-sm italic">
                    Ask Codex a question or click "Next Topic" to continue learning...
                  </div>
                )}
              </div>
            </div>

            {/* Session Logs */}
            {sessionLogs && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-bold text-green-400 text-sm">Progress Logs</span>
                </div>
                <div className="bg-green-900/20 rounded-lg p-3 border border-green-400/20">
                  <div className="text-green-200 text-xs leading-relaxed whitespace-pre-wrap">
                    {sessionLogs}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Query Input */}
          <div className="p-4 border-t border-amber-400/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask Codex anything about this mission..."
                className="flex-1 px-4 py-3 bg-gray-900 border border-amber-400/30 rounded-xl text-amber-100 placeholder-amber-200/50 focus:outline-none focus:border-amber-400"
                onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
              />
              <button
                onClick={handleQuerySubmit}
                disabled={isQueryLoading}
                className="px-6 py-3 bg-amber-400 text-black rounded-xl font-bold hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {queryInput.trim() ? <Send size={16} /> : <ArrowRight size={16} />}
                {queryInput.trim() ? 'Ask' : 'Next Topic'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Code IDE */}
        <div className="w-1/2 bg-gray-900 text-green-400 flex flex-col">
          {/* IDE Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm font-mono">mission_{selectedMission}.js</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Practice Arena</span>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="// Write your code here to practice what you've learned..."
              className="w-full h-full p-4 bg-transparent text-green-400 font-mono text-sm resize-none outline-none placeholder-gray-500 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Mentor Feedback */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-blue-400 text-sm">AI Mentor</span>
              {isMentorLoading && (
                <div className="w-3 h-3 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
              )}
            </div>
            <div className="bg-gray-900 rounded-lg p-3 min-h-[60px] border border-gray-700">
              {mentorFeedback ? (
                <p className="text-blue-200 text-sm leading-relaxed">{mentorFeedback}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  {isMentorLoading ? 'Analyzing your code...' : 'Start coding to get real-time feedback...'}
                </p>
              )}
            </div>
          </div>

          {/* Mission Completion */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => completeMission(selectedMission)}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-500 hover:to-green-400 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              Complete Mission {selectedMission}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}