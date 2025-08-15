'use client';

import { useState, useEffect } from 'react';
import Chat from './Chat';
import MissionSidebar from './MissionSidebar';
import { supabase } from '../../lib/supabase_client';
import { useMissionState } from '../utils/missionUtils';

const MissionInterface = ({
  missionNumber,
  missionTitle,
  missionDescription,
  username,
  onBackToCodex,
  onMissionComplete,
}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const initialObjectives = missionDescription
    .split('\n')
    .filter((line) => line.startsWith('* '))
    .map((line) => ({ text: line.substring(2), completed: false }));

  const { objectives, toggleObjective } = useMissionState(initialObjectives);

  useEffect(() => {
    const welcomeMessage = {
      text: `Welcome to Mission ${missionNumber}: ${missionTitle}! I'm here to help you with this mission.`,
      isUser: false,
    };
    setMessages([welcomeMessage]);
  }, [missionNumber, missionTitle]);

  const handleSendMessage = async (input) => {
    const userMessage = { text: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .slice(-5)
        .map((msg) => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MENTOR_API_URL}/codex`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: input,
            mission: `Mission ${missionNumber}: ${missionTitle} - ${missionDescription}`,
            logs: `Mission ${missionNumber} logs`,
            history: conversationHistory,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = {
          text:
            data.response ||
            "I apologize, but I encountered an issue processing your request.",
          isUser: false,
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        if (data.end_mission === 'true' || data.end_mission === true) {
          setTimeout(() => {
            handleCompleteMission();
          }, 1000);
        }
      } else {
        const errorMessage = {
          text: 'Sorry, I encountered an error. Please try again.',
          isUser: false,
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMission = async () => {
    try {
      const { data, error } = await supabase
        .from('codex')
        .select('active_status')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching active status:', error);
        return;
      }

      const newActiveStatus = (data?.active_status || 0) + 1;

      const { error: updateError } = await supabase
        .from('codex')
        .update({ active_status: newActiveStatus })
        .eq('username', username);

      if (updateError) {
        console.error('Error updating active status:', updateError);
        return;
      }

      onMissionComplete?.(missionNumber);
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  return (
    <div className="flex h-screen font-mono bg-gray-800">
      <Chat
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
      <MissionSidebar
        missionTitle={missionTitle}
        objectives={objectives}
        onToggleObjective={toggleObjective}
        onCompleteMission={handleCompleteMission}
      />
    </div>
  );
};

export default MissionInterface;