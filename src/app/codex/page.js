'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase_client";
import useUserStore from "../store/useUserStore";
import useLoadingStore from "../store/useLoadingStore";
import SideBar from "../components/SideBar";
import PromptRefinerQueryBox from "./components/PromptRefinerQueryBox";
import RoadmapGrid from "./components/RoadmapGrid";
import EnhancedMissionsSection from './components/EnhancedMissionsSection'; // Import the enhanced component
import WelcomeSection from "./components/WelcomeSection";
import LoadingSection from "./components/LoadingSection";
import { checkUsername, loadMissions } from "./utils/userRoadmap";
import parseTaggedResponse from "./utils/parseResponse";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
      const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

// Tab Navigation Component
function TabNavigation({ activeTab, setActiveTab, userExists }) {
  const tabs = [
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'missions', label: 'Missions' }
  ];

  if (!userExists) return null;

  return (
    <div className="flex justify-center mb-6 lg:mb-8">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 shadow-lg">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Codex() {
  const [userExists, setUserExists] = useState(null);
  const [missions, setMissions] = useState([]);
  const [activeStatus, setActiveStatus] = useState([]); // Add this state for mission status tracking
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');

  const {
    user,
    username,
    setUserSession,
    setUsername,
    clearUserSession,
  } = useUserStore();

  const { loading, setLoading, isGeneratingRoadmap, setIsGeneratingRoadmap } = useLoadingStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setUserExists(null);
      setInitialDataLoaded(false);
      try {
        const exists = await checkUsername(username);
        setUserExists(exists);
        if (exists) {
          const roadmap = await loadMissions(username);
          if (roadmap) {
            const parsed = parseTaggedResponse(roadmap);
            setMissions(parsed);
            
            // Extract active_status from your database
            // This should come from your codex table's active_status column
            const statusResponse = await supabase
              .from('codex')
              .select('active_status')
              .eq('username', username)
              .single();
            
            if (statusResponse.data?.active_status && Array.isArray(statusResponse.data.active_status)) {
              setActiveStatus(statusResponse.data.active_status);
            } else {
              // Default: first mission is active, rest are inactive
              const defaultStatus = parsed.map((_, index) => 
                index === 0 ? 'active' : 'not_active'
              );
              setActiveStatus(defaultStatus);
              
              // Save the default status to database
              await supabase
                .from('codex')
                .update({ active_status: defaultStatus })
                .eq('username', username);
            }
          }
        }
      } catch (err) {
        console.error("Codex fetch error:", err);
      } finally {
        setLoading(false);
        setInitialDataLoaded(true);
      }
    };

    fetchUserData();
  }, [username, setLoading]);

  // Update the mission completion handler
  const updateMissionStatus = async (missionIndex, newStatus) => {
    const updatedStatus = [...activeStatus];
    updatedStatus[missionIndex] = newStatus;
    
    // If completing a mission, activate the next one
    if (newStatus === 'completed' && missionIndex + 1 < missions.length) {
      updatedStatus[missionIndex + 1] = 'active';
    }
    
    setActiveStatus(updatedStatus);
    
    // Save to database
    await supabase
      .from('codex')
      .update({ active_status: updatedStatus })
      .eq('username', username);
  };

  const handleCreateRoadmapFromRefinedPrompt = async (refinedPrompt, duration) => {
    setLoading(true);
    setIsGeneratingRoadmap(true);

    try {
      const response = await fetch('https://bepro-codex.onrender.com/create-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: refinedPrompt,
          context: `Duration: ${duration}, Username: ${username}`
        })
      });

      if (response.ok) {
        const roadmapData = await response.text();
        const parsed = parseTaggedResponse(roadmapData);

        if (Array.isArray(parsed)) {
          parsed.forEach((mission, index) => {
            mission.status = index === 0 ? "active" : "not_active";
          });
        }

        // Initialize activeStatus for new roadmap
        const defaultStatus = parsed.map((_, index) => 
          index === 0 ? 'active' : 'not_active'
        );

        const { error } = await supabase
          .from('codex')
          .upsert([{
            username: username,
            roadmap: parsed,
            active_status: defaultStatus, // Save the default status
            created_at: new Date().toISOString()
          }]);

        if (!error) {
          setMissions(parsed);
          setActiveStatus(defaultStatus);
          setUserExists(true);
        } else {
          alert('Failed to save roadmap to database');
        }
      } else {
        alert('Failed to generate roadmap');
      }
    } catch (error) {
      console.error('Error creating roadmap:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
      setIsGeneratingRoadmap(false);
    }
  };

  if (!initialDataLoaded || (loading && userExists === null) || isGeneratingRoadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
        <SideBar />
        <div className="transition-all duration-300 ease-in-out min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72">
          <div className="px-3 lg:px-8 py-4 lg:py-8">
            <motion.div
              className="text-center mb-6 lg:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="lg:hidden mb-6">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Codex</h1>
                <p className="text-gray-600">Your Career-pathing Engine</p>
              </div>
              <WelcomeSection className="relative top-10 mb-10" username={username} />
              <LoadingSection />
              {isGeneratingRoadmap && (
                <div className="mt-4 text-center">
                  <p className="text-gray-700 font-semibold">
                    Generating your personalized roadmap...
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    This may take a few moments. Feel free to browse
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
      <SideBar />
      <div className="transition-all duration-300 ease-in-out min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72">
        <div className="px-3 lg:px-8 py-4 lg:py-8">
          <motion.div
            className="text-center mb-6 lg:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-black text-gray-900 mb-2">Codex</h1>
              <p className="text-gray-600">Your Career-pathing Engine</p>
            </div>
            <WelcomeSection className="relative top-10 mb-16" username={username} />
            
            {/* Tab Navigation */}
            <TabNavigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              userExists={userExists} 
            />
            
            {userExists ? (
              <div className="mt-16">
                {activeTab === 'roadmap' && (
                  <RoadmapGrid missions={missions} username={username} />
                )}
                {activeTab === 'missions' && (
                  <EnhancedMissionsSection 
                    missions={missions} 
                    username={username}
                    activeStatus={activeStatus}
                    onUpdateMissionStatus={updateMissionStatus}
                  />
                )}
              </div>
            ) : (
              <>
                {isMobile ? (
                  <div className="text-center text-sm text-gray-700 bg-white p-4 rounded-lg shadow-md">
                    🚫 The roadmap generator is available only on desktop. Please switch to a PC to access this feature.
                  </div>
                ) : (
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex justify-center relative top-10">
                      <PromptRefinerQueryBox
                        onFinalPrompt={handleCreateRoadmapFromRefinedPrompt}
                        disabled={loading || isGeneratingRoadmap}
                        loading={loading || isGeneratingRoadmap}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}