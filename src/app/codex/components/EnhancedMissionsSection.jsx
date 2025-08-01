import React, { useState, useEffect } from 'react';
import { Play, MessageSquare, Book, CheckCircle, Circle, Code, Terminal, Send, RotateCcw } from 'lucide-react';

// Enhanced Missions Section Component
function EnhancedMissionsSection({ missions, username, activeStatus, onUpdateMissionStatus }) {
  const [selectedMission, setSelectedMission] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [ideCode, setIdeCode] = useState('// Start coding here...');
  const [logs, setLogs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionResponse, setSessionResponse] = useState('');

  // Ensure missions is always an array
  const missionsArray = Array.isArray(missions) ? missions : [];

  // Find the active mission based on activeStatus
  const activeMission = missionsArray.find((mission, index) => 
    activeStatus && activeStatus[index] === 'active'
  ) || missionsArray[0];

  // Set the first active mission as selected by default
  useEffect(() => {
    if (activeMission && !selectedMission) {
      setSelectedMission(activeMission);
    }
  }, [activeMission, selectedMission]);

  // Handle mission selection
  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setSessionResponse('');
    setChatHistory([]);
    setLogs('');
    setIdeCode('// Start coding here...');
  };

  // Handle query submission
  const handleQuerySubmit = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage = currentInput;
    setChatHistory(prev => [...prev, { type: 'user', content: userMessage }]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: userMessage,
          logs: logs,
          history: chatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setSessionResponse(data.session || '');
        setIdeCode(data.ide || ideCode);
        setLogs(data.logs || logs);
        
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          content: data.session || 'Response received'
        }]);
      } else {
        setChatHistory(prev => [...prev, { 
          type: 'error', 
          content: 'Failed to get response from Codex'
        }]);
      }
    } catch (error) {
      console.error('Query error:', error);
      setChatHistory(prev => [...prev, { 
        type: 'error', 
        content: 'Network error occurred'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code execution (placeholder - you can integrate with your code execution service)
  const handleCodeExecution = () => {
    setChatHistory(prev => [...prev, { 
      type: 'system', 
      content: 'Code executed successfully!' 
    }]);
  };

  // Reset the current mission
  const resetMission = () => {
    setSessionResponse('');
    setChatHistory([]);
    setLogs('');
    setIdeCode('// Start coding here...');
    setCurrentInput('');
  };

  // Complete mission handler
  const handleCompleteMission = (index) => {
    if (onUpdateMissionStatus) {
      onUpdateMissionStatus(index, 'completed');
    }
  };

  if (!missionsArray.length) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Missions</h2>
        <div className="text-center text-gray-600 py-8">
          <p>No missions available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mission Overview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Missions</h2>
        
        {/* Mission List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {missionsArray.map((mission, index) => {
            const isActive = activeStatus && activeStatus[index] === 'active';
            const isCompleted = activeStatus && activeStatus[index] === 'completed';
            const isSelected = selectedMission === mission;
            
            return (
              <div
                key={index}
                onClick={() => handleMissionSelect(mission)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50'
                    : isActive
                    ? 'border-green-500 bg-green-50/50 hover:bg-green-50/70'
                    : isCompleted
                    ? 'border-gray-400 bg-gray-50/50 hover:bg-gray-50/70'
                    : 'border-gray-300 bg-white/20 hover:bg-white/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Mission {index + 1}
                  </h3>
                  {isActive ? (
                    <Circle className="w-4 h-4 text-green-500 fill-current" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-700 text-xs leading-tight line-clamp-3">
                  {mission.title || mission.content || 'Mission details...'}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      isActive
                        ? 'bg-green-200 text-green-800'
                        : isCompleted
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {isActive ? 'Active' : isCompleted ? 'Completed' : 'Pending'}
                  </span>
                  
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteMission(index);
                      }}
                      className="text-xs px-2 py-1 bg-green-500 text-white rounded-full hover:bg-green-600"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission Workspace */}
      {selectedMission && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {selectedMission.title || `Mission ${missionsArray.indexOf(selectedMission) + 1}`}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {selectedMission.description || selectedMission.content}
              </p>
            </div>
            <button
              onClick={resetMission}
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-gray-900">Chat with Codex</h4>
              </div>
              
              {/* Chat History */}
              <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                <div className="space-y-3">
                  {chatHistory.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-8">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Start a conversation with Codex about this mission
                    </div>
                  ) : (
                    chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white ml-8'
                            : message.type === 'assistant'
                            ? 'bg-gray-700 text-green-400 mr-8'
                            : message.type === 'system'
                            ? 'bg-yellow-600 text-white text-center'
                            : 'bg-red-600 text-white mr-8'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="bg-gray-700 text-green-400 mr-8 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <span className="text-sm ml-2">Codex is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
                  placeholder="Ask Codex about this mission..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  disabled={isLoading}
                />
                <button
                  onClick={handleQuerySubmit}
                  disabled={isLoading || !currentInput.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* IDE Interface */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-gray-900">Code Editor</h4>
                </div>
                <button
                  onClick={handleCodeExecution}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                >
                  <Play className="w-4 h-4" />
                  Run
                </button>
              </div>

              {/* Code Editor */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-800">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-400 text-xs font-mono">mission.js</span>
                </div>
                
                <textarea
                  value={ideCode}
                  onChange={(e) => setIdeCode(e.target.value)}
                  className="w-full h-48 bg-transparent text-green-400 font-mono text-sm resize-none outline-none p-4 placeholder-gray-500"
                  spellCheck={false}
                />
              </div>

              {/* Logs Section */}
              {logs && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-yellow-500" />
                    <h5 className="font-medium text-gray-900 text-sm">Progress Logs</h5>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm font-mono">{logs}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedMissionsSection;