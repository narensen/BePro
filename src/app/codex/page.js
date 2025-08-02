'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase_client";
import useUserStore from "../store/useUserStore";
import useLoadingStore from "../store/useLoadingStore";
import SideBar from "../components/SideBar";
import PromptRefinerQueryBox from "./components/PromptRefinerQueryBox";
import RoadmapGrid from "./components/RoadmapGrid";
import WelcomeSection from "./components/WelcomeSection";
import LoadingSection from "./components/LoadingSection";
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
              setMissions(parsed);
            }
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
            {userHasRoadmap ? (
              <div className="mt-6 lg:mt-8">
                <RoadmapGrid missions={missions} username={username} />
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