import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase_client';

// Import components
import MissionHeader from './MissionInterface/MissionHeader';
import MissionSidebar from './MissionInterface/MissionSidebar';
import ChatArea from './MissionInterface/ChatArea';
import CodeEditor from './MissionInterface/CodeEditor';
import ChatInput from './MissionInterface/ChatInput';
import LoadingState from './MissionInterface/LoadingState';

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
  const [showSidebar, setShowSidebar] = useState(false); // Start with sidebar closed
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Load existing session messages for this mission
  useEffect(() => {
    const loadMissionSession = async () => {
      try {
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

  // Save session to Supabase
  const saveMissionSession = async (newMessages) => {
    try {
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
      
      const updatedSession = {
        ...currentSession,
        [missionSessionKey]: newMessages
      };

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

  // Handle automatic mission completion
  const handleAutoMissionComplete = async () => {
    try {
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
      const newActiveStatus = currentActiveStatus + 1;
      
      const { error: updateError } = await supabase
        .from('codex')
        .update({ active_status: newActiveStatus })
        .eq('username', username);

      if (updateError) {
        console.error('Error updating active status:', updateError);
        return;
      }

      const completionMessage = {
        id: Date.now(),
        type: 'system',
        content: `🎉 Congratulations! You have successfully completed Mission ${missionNumber}: ${missionTitle}!\n\nBased on your progress, I've determined you're ready to move on to the next challenge. Keep up the great work!`,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...messages, completionMessage];
      setMessages(finalMessages);
      await saveMissionSession(finalMessages);
      
      setTimeout(() => {
        onMissionComplete?.(missionNumber);
      }, 3000);
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

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
      const recentMessages = messages.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      const conversationHistory = messages.length > 0 ? recentMessages : 'Starting new mission conversation';

      const response = await fetch(`${process.env.NEXT_PUBLIC_MENTOR_API_URL}/codex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: currentInput,
          mission: `Mission ${missionNumber}: ${missionTitle} - ${missionDescription}`,
          logs: `Mission ${missionNumber} logs`,
          history: conversationHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const shouldEndMission = data.end_mission === "true" || data.end_mission === true;
        
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: data.response || 'I apologize, but I encountered an issue processing your request.',
          timestamp: new Date().toISOString()
        };

        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        await saveMissionSession(finalMessages);

        if (shouldEndMission) {
          setTimeout(() => {
            handleAutoMissionComplete();
          }, 1000);
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

  if (!sessionLoaded) {
    return <LoadingState missionNumber={missionNumber} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono flex flex-col">
      <MissionHeader
        missionNumber={missionNumber}
        missionTitle={missionTitle}
        onBackToCodex={onBackToCodex}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <MissionSidebar
            missionDescription={missionDescription}
            setCurrentInput={setCurrentInput}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
          />
        )}

        <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-sm">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
          />

          {showCodeEditor && (
            <CodeEditor
              showCodeEditor={showCodeEditor}
              setShowCodeEditor={setShowCodeEditor}
              codeInput={codeInput}
              setCodeInput={setCodeInput}
              setCurrentInput={setCurrentInput}
            />
          )}

          <ChatInput
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
            showCodeEditor={showCodeEditor}
            setShowCodeEditor={setShowCodeEditor}
          />
        </div>
      </div>
    </div>
  );
};

export default MissionInterface;