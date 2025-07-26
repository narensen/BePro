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

export default function Codex() {
  const { user, username } = useUserStore();
  const upper_User = username.charAt(0).toUpperCase() + username.slice(1);

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [missions, setMissions] = useState([]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
      {/* Mobile-First Sidebar */}
      <SideBar />

      {/* Main Content - Mobile Optimized */}
      <div className="transition-all duration-300 ease-in-out min-h-screen pb-20 lg:pb-0 lg:ml-72">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 p-3 lg:p-6 mt-16 lg:mt-0">
          <div className="text-center lg:text-left">
            <h1 className="font-bold text-2xl lg:text-3xl text-gray-900">Codex</h1>
            <p className="text-sm lg:text-base text-black/60 mt-1">Your Career-pathing Engine</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="px-3 lg:px-8 py-4 lg:py-8">
          <motion.div
            className="text-center mb-6 lg:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
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
                    disabled={false}
                    submitting={false}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}