'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase_client";
import useUserStore from "../store/useUserStore";
import useLoadingStore from "../store/useLoadingStore";
import SideBar from "../components/SideBar";
import QueryBox from "./components/QueryBox";
import QuickPrompts from "./components/QuickPrompts";
import RoadmapGrid from "./components/RoadmapGrid";
import WelcomeSection from "./components/WelcomeSection";
import LoadingSection from "./components/LoadingSection";
import { checkUsername, loadMissions } from "./utils/userRoadmap";
import parseTaggedResponse from "./utils/parseResponse";

// Mobile detection hook
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
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("");
  const [userExists, setUserExists] = useState(null);
  const [missions, setMissions] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const {
    user,
    username,
    setUserSession,
    setUsername,
    clearUserSession,
  } = useUserStore();

  // Use the universal loading store
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

  const handleCreateRoadmap = async () => {
    if (!prompt.trim() || !duration) {
      alert('Please enter a goal and select duration');
      return;
    }

    // Set both loading states to ensure persistence across tab changes
    setLoading(true);
    setIsGeneratingRoadmap(true);
    
    try {
      const response = await fetch('https://bepro-codex.onrender.com/create-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: prompt,
          context: `Duration: ${duration}, Username: ${username}`
        })
      });

      if (response.ok) {
        const roadmapData = await response.text();
        const parsed = parseTaggedResponse(roadmapData);
        const { error } = await supabase
          .from('codex')
          .upsert([{
            username: username,
            roadmap: parsed,
            created_at: new Date().toISOString()
          }]);

        if (!error) {
          setMissions(parsed);
          setUserExists(true);
          // Clear the prompt after successful generation
          setPrompt("");
          setDuration("");
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
      // Clear both loading states only after everything is complete
      setLoading(false);
      setIsGeneratingRoadmap(false);
    }
  };

  // Show loading screen when:
  // 1. Initial data hasn't loaded yet, OR
  // 2. Currently loading initial data, OR 
  // 3. Currently generating a roadmap (this persists across tabs)
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
              
              {/* Show different loading message when generating roadmap */}
              {isGeneratingRoadmap && (
                <div className="mt-4 text-center">
                  <p className="text-gray-700 font-semibold">
                    🚀 Generating your personalized roadmap...
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    This may take a few moments. Feel free to browse other tabs!
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

            <WelcomeSection className="relative top-10 mb-10" username={username} />

            {userExists ? (
              <div className="mt-6 lg:mt-8">
                <RoadmapGrid missions={missions} username={username} />
              </div>
            ) : (
              <>
                {isMobile ? (
                  <div className="text-center text-sm text-gray-700 bg-white p-4 rounded-lg shadow-md">
                    🚫 The roadmap generator is available only on desktop. Please switch to a PC or tablet to access this feature.
                  </div>
                ) : (
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex justify-center relative top-10">
                      <QueryBox
                        prompt={prompt}
                        setPrompt={setPrompt}
                        duration={duration}
                        setDuration={setDuration}
                      />
                    </div>

                    <div className="w-full flex justify-center">
                      <button
                        onClick={handleCreateRoadmap}
                        disabled={loading || isGeneratingRoadmap || !prompt.trim() || !duration}
                        className="px-8 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-xl font-black text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                      >
                        {(loading || isGeneratingRoadmap) ? (
                          <>
                            <div className="w-5 h-5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin"></div>
                            Generating Roadmap...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Generate My Roadmap
                          </>
                        )}
                      </button>
                    </div>

                    <div className="w-256 pl-50">
                      <QuickPrompts
                        handlePrompt={(prompt) => setPrompt(prompt)}
                        disabled={loading || isGeneratingRoadmap}
                        submitting={loading || isGeneratingRoadmap}
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