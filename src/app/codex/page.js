'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase_client";
import useUserStore from "../store/useUserStore";
import SideBar from "../components/SideBar";
import QueryBox from "./components/QueryBox";
import QuickPrompts from "./components/QuickPrompts";
import RoadmapGrid from "./components/RoadmapGrid";

import { checkUsername, loadMissions } from "./utils/userRoadmap";
import parseTaggedResponse from "./utils/parseResponse";
import MissionInterface from "./components/MissionInterface";

export default function Codex() {
  const { user, username } = useUserStore();
  const upper_User = username.charAt(0).toUpperCase() + username.slice(1);

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [missions, setMissions] = useState([]);
  const [showMissionInterface, setShowMissionInterface] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error);
    else location.reload();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const exists = await checkUsername(username);
        setUserExists(exists);
        if (exists) {
          const roadmap = await loadMissions(username);
          if (roadmap) {
            const parsed = parseTaggedResponse(roadmap);
            setMissions(parsed);
            setShowMissionInterface(true);
          }
        }
      } catch (err) {
        console.error("Codex fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const handleCreateRoadmap = async () => {
    if (!prompt.trim() || !duration) {
      alert('Please enter a goal and select duration');
      return;
    }

    setLoading(true);
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
        
        // Save to database
        const { error } = await supabase
          .from('codex')
          .upsert([{
            username: username,
            roadmap: roadmapData,
            created_at: new Date().toISOString()
          }]);

        if (!error) {
          const parsed = parseTaggedResponse(roadmapData);
          setMissions(parsed);
          setUserExists(true);
          setShowMissionInterface(true);
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
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
      {/* Mobile-First Sidebar */}
      <SideBar />

      {/* Main Content - Mobile Optimized */}
      <div className="transition-all duration-300 ease-in-out min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72">
        {/* Mobile Header */}

        {showMissionInterface && Object.keys(missions).length > 0 ? (
          <MissionInterface missions={missions} username={username} />
        ) : (
          <div className="px-3 lg:px-8 py-4 lg:py-8">
            <motion.div
              className="text-center mb-6 lg:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Mobile Title */}
              <div className="lg:hidden mb-6">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Codex</h1>
                <p className="text-gray-600">Your Career-pathing Engine</p>
              </div>
              
              <p className="text-3xl lg:text-6xl font-bold text-black mb-2 lg:mb-4">
                Welcome, {upper_User}!
              </p>
              <p className="text-sm lg:text-lg text-black/70 px-4">
                Here you can create and manage your career roadmap.
              </p>

              {loading || userExists === null ? (
                <div className="mt-8 flex flex-col items-center">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin"></div>
                  <p className="mt-4 text-black font-semibold text-sm lg:text-base">Loading...</p>
                </div>
              ) : userExists ? (
                <div className="mt-6 lg:mt-8">
                  <RoadmapGrid missions={missions} />
                </div>
              ) : (
                <div className="mt-6 lg:mt-8 space-y-4 lg:space-y-6">
                  {/* Mobile-Optimized Query Box */}
                  <div className="w-full">
                    <QueryBox
                      prompt={prompt}
                      setPrompt={setPrompt}
                      duration={duration}
                      setDuration={setDuration}
                    />
                  </div>
                  
                  {/* Mobile-Optimized Quick Prompts */}
                  <div className="w-full">
                    <QuickPrompts
                      handlePrompt={(prompt) => setPrompt(prompt)}
                      disabled={loading}
                      submitting={loading}
                    />
                  </div>

                  {/* Generate Roadmap Button */}
                  <div className="w-full flex justify-center">
                    <button
                      onClick={handleCreateRoadmap}
                      disabled={loading || !prompt.trim() || !duration}
                      className="px-8 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-xl font-black text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin"></div>
                          Generating Roadmap...
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          Generate My Roadmap
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}