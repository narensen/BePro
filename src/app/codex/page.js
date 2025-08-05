'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from 'lucide-react';
import { supabase } from "../lib/supabase_client";
import useUserStore from "../store/useUserStore";
import useLoadingStore from "../store/useLoadingStore";
import SideBar from "../components/SideBar";
import PromptRefinerQueryBox from "./components/PromptRefinerQueryBox";
import RoadmapGrid from "./components/RoadmapGrid";
import WelcomeSection from "./components/WelcomeSection";
import LoadingSection from "./components/LoadingSection";
import MissionInterface from './components/MissionInterface';
import RoadmapGridWithMission from './components/RoadmapGridWithMission';
import { loadMissions } from "./utils/userRoadmap";
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


export default function Codex() {
  const [userHasRoadmap, setUserHasRoadmap] = useState(null);
  const [missions, setMissions] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Mission Interface state
  const [showMissionInterface, setShowMissionInterface] = useState(false);
  const [activeMissionData, setActiveMissionData] = useState(null);

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
    const checkUserRoadmap = async () => {
      if (!username) return;
      
      setLoading(true);
      setUserHasRoadmap(null);
      setInitialDataLoaded(false);
      
      try {
        // Directly check if username exists in codex table
        const { data, error } = await supabase
          .from('codex')
          .select('username')
          .eq('username', username)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "not found"
          console.error("Error checking user roadmap:", error);
          setUserHasRoadmap(false);
        } else {
          // User exists in codex table if we got data
          const exists = !!data;
          setUserHasRoadmap(exists);
          
          if (exists) {
            // Load the missions data
            const roadmap = await loadMissions(username);
            if (roadmap) {
              const parsed = parseTaggedResponse(roadmap);
              
              // Handle both object and array formats
              let missionsData;
              if (Array.isArray(parsed)) {
                // Convert array to object format expected by RoadmapGrid
                missionsData = {};
                parsed.forEach((mission, index) => {
                  missionsData[index] = mission;
                });
              } else if (parsed && typeof parsed === 'object') {
                // Already in object format
                missionsData = parsed;
              } else {
                console.error('Parsed roadmap is neither array nor object:', parsed);
                setMissions({});
                return;
              }
              
              // Get the current active_status from database
              const { data: statusData } = await supabase
                .from('codex')
                .select('active_status')
                .eq('username', username)
                .single();
              
              const activeStatus = statusData?.active_status || 0;
              
              // Set mission statuses based on active_status
              Object.keys(missionsData).forEach((key, index) => {
                if (index < activeStatus) {
                  missionsData[key].status = "completed";
                } else if (index === activeStatus) {
                  missionsData[key].status = "active";
                } else {
                  missionsData[key].status = "not_active";
                }
              });
              
              setMissions(missionsData);
            } else {
              setMissions({});
            }
          } else {
            setMissions({});
          }
        }
      } catch (err) {
        console.error("Codex fetch error:", err);
        setUserHasRoadmap(false);
      } finally {
        setLoading(false);
        setInitialDataLoaded(true);
      }
    };

    checkUserRoadmap();
  }, [username, setLoading]);

  // Function to get the active mission data
  const getActiveMissionData = async () => {
    try {
      const { data, error } = await supabase
        .from('codex')
        .select('active_status, roadmap')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching active mission:', error);
        return null;
      }

      const activeStatus = data.active_status || 0;
      const roadmap = data.roadmap || {};
      
      // Convert roadmap object to array for easier processing
      const roadmapArray = Object.entries(roadmap).map(([key, mission]) => ({ ...mission, id: key }));
      const activeMissionNumber = activeStatus + 1;

      // Check if there's an active mission available
      if (activeMissionNumber <= roadmapArray.length) {
        const activeMission = roadmapArray[activeStatus];
        return {
          number: activeMissionNumber,
          title: activeMission.title,
          description: activeMission.description || activeMission.content || 'No description available',
          totalMissions: roadmapArray.length
        };
      }

      return null; // All missions completed
    } catch (error) {
      console.error('Error in getActiveMissionData:', error);
      return null;
    }
  };

  // Function to handle starting a mission
  const handleStartMission = async () => {
    const missionData = await getActiveMissionData();
    
    if (missionData) {
      setActiveMissionData(missionData);
      setShowMissionInterface(true);
    } else {
      alert('🎉 Congratulations! You have completed all missions in your roadmap!');
    }
  };

  // Function to handle mission completion
  const handleMissionComplete = async (completedMissionNumber) => {
    try {
      // Refresh the missions data to reflect the updated status
      const roadmap = await loadMissions(username);
      if (roadmap) {
        const parsed = parseTaggedResponse(roadmap);
        
        // Handle both object and array formats
        let missionsData;
        if (Array.isArray(parsed)) {
          missionsData = {};
          parsed.forEach((mission, index) => {
            missionsData[index] = mission;
          });
        } else if (parsed && typeof parsed === 'object') {
          missionsData = parsed;
        } else {
          console.error('Error parsing roadmap after completion');
          return;
        }
        
        // Get the updated active status
        const { data } = await supabase
          .from('codex')
          .select('active_status')
          .eq('username', username)
          .single();
        
        const activeStatus = data?.active_status || 0;
        
        // Update mission statuses based on active_status
        Object.keys(missionsData).forEach((key, index) => {
          if (index < activeStatus) {
            missionsData[key].status = "completed";
          } else if (index === activeStatus) {
            missionsData[key].status = "active";
          } else {
            missionsData[key].status = "not_active";
          }
        });
        
        setMissions(missionsData);
      }
      
      // Go back to the main codex page
      setShowMissionInterface(false);
      setActiveMissionData(null);
      
      // Show success message
      alert(`🎉 Mission ${completedMissionNumber} completed successfully!`);
    } catch (error) {
      console.error('Error handling mission completion:', error);
    }
  };

  // Function to handle going back to codex
  const handleBackToCodex = () => {
    setShowMissionInterface(false);
    setActiveMissionData(null);
  };

  const handleCreateRoadmapFromRefinedPrompt = async (refinedPrompt, duration) => {
    setLoading(true);
    setIsGeneratingRoadmap(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CODEX_API_URL}/create-roadmap`, {
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

        const { error } = await supabase
          .from('codex')
          .upsert([{
            username: username,
            roadmap: parsed,
            created_at: new Date().toISOString()
          }]);

        if (!error) {
          setMissions(parsed);
          setUserHasRoadmap(true);
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

  // Show loading screen when:
  // 1. Initial data hasn't loaded yet
  // 2. We're checking if the user has a roadmap (userHasRoadmap is null)
  // 3. We're generating a roadmap
  if (!initialDataLoaded || userHasRoadmap === null || isGeneratingRoadmap) {
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

  // Main render with mission interface integration
  return (
    <>
      {showMissionInterface ? (
        <MissionInterface
          missionNumber={activeMissionData.number}
          missionTitle={activeMissionData.title}
          missionDescription={activeMissionData.description}
          username={username}
          onBackToCodex={handleBackToCodex}
          onMissionComplete={handleMissionComplete}
        />
      ) : (
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
                {userHasRoadmap ? (
                  <div className="mt-6 lg:mt-8">
                    <RoadmapGridWithMission 
                      missions={missions} 
                      username={username} 
                      onStartMission={handleStartMission}
                    />
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
      )}
    </>
  );
}