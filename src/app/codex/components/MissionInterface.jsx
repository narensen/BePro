import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const [showSidebar, setShowSidebar] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  
  // Auto-hide header states
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const chatAreaRef = useRef(null);

  // Auto-hide header functionality
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // Show header when there's activity
    setHeaderVisible(true);
    
    // Set timer to hide header after 5 seconds of inactivity
    const timer = setTimeout(() => {
      setHeaderVisible(false);
    }, 5000);
    
    setInactivityTimer(timer);
  };

  const handleScroll = (e) => {
    const currentScrollTop = e.target.scrollTop;
    
    // Check if scrolling up
    if (currentScrollTop < lastScrollTop && currentScrollTop > 0) {
      // Scrolling up - show header and reset timer
      resetInactivityTimer();
    } else if (currentScrollTop > lastScrollTop) {
      // Scrolling down - just reset timer
      resetInactivityTimer();
    }
    
    setLastScrollTop(currentScrollTop);
  };

  // Initialize header auto-hide
  useEffect(() => {
    // Start the initial timer
    resetInactivityTimer();
    
    // Cleanup timer on unmount
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, []);

  // Reset timer on any user interaction
  const handleUserActivity = () => {
    resetInactivityTimer();
  };

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
              content: `Welcome to Mission ${missionNumber}\nI'm here to guide you through this mission. Feel free to ask questions, request explanations, or share your code for review. Let's start your learning journey!`,
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

    // Track user activity when sending message
    handleUserActivity();

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
    <div className="min-h-screen font-mono">
      {/* Fixed Header with Auto-Hide */}
      <div className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-out ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <MissionHeader
          missionNumber={missionNumber}
          missionTitle={missionTitle}
          onBackToCodex={onBackToCodex}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-screen pt-16 transition-all duration-500 ease-in-out">
        {/* Sidebar - Fixed position, lower z-index to not interfere with footer */}
        <div className={`fixed left-0 top-16 bottom-0 w-80 bg-white border-r border-gray-200 shadow-lg z-20 transform transition-transform duration-500 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full overflow-y-auto pb-24">
            <MissionSidebar
              missionDescription={missionDescription}
              setCurrentInput={setCurrentInput}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
          </div>
        </div>

        {/* Main Chat Area - Smoothly adjusts position when sidebar is open */}
        <div className={`flex-1 flex flex-col bg-white/95 backdrop-blur-sm transition-all duration-500 ease-in-out ${showSidebar ? 'ml-80' : 'ml-0'} pb-32`}>
          {/* Chat Messages Area - Full scroll capability with scroll detection */}
          <div 
            ref={chatAreaRef}
            className="flex-1 transition-all duration-300 ease-in-out overflow-y-auto"
            onScroll={handleScroll}
            onMouseMove={handleUserActivity}
            onClick={handleUserActivity}
          >
            <div className={`h-full transition-all duration-500 ease-in-out ${showSidebar ? 'px-8' : 'px-4'}`}>
              <ChatArea
                messages={messages}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Code Editor - Conditional with smooth appearance */}
          {showCodeEditor && (
            <div className="border-t border-gray-200 bg-white transform transition-all duration-300 ease-in-out animate-in slide-in-from-bottom">
              <CodeEditor
                showCodeEditor={showCodeEditor}
                setShowCodeEditor={setShowCodeEditor}
                codeInput={codeInput}
                setCodeInput={setCodeInput}
                setCurrentInput={setCurrentInput}
              />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer - Chat Input adjusts based on sidebar state */}
      <div className={`fixed bottom-0 z-40 bg-white border-t border-gray-200 shadow-lg transition-all duration-500 ease-in-out ${showSidebar ? 'left-80 right-0' : 'left-0 right-0'}`}>
        <div onMouseMove={handleUserActivity} onFocus={handleUserActivity}>
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