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
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">

      <div className="pl-72 pt-4 absolute relative left-2">
        <h1 className="font-bold text-3xl">Codex</h1>
        <p className="mt-1 text-black/60">Your Career-pathing Engine</p>
      </div>

      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>

      <div className="ml-72 pt-8 flex flex-col items-center min-h-screen">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="text-6xl font-bold text-black">Welcome, {upper_User}!</p>
          <p className="text-lg text-black/70">
            Here you can create and manage your career roadmap.
          </p>

          {loading || userExists === null ? (
            <p className="mt-8 text-black font-semibold">Loading...</p>
          ) : userExists ? (
            <div className="mt-8 w-full px-8">
              <RoadmapGrid missions={missions} />
            </div>
          ) : (
            <>
              <div className="w-full px-8 mt-8">
                <QueryBox
                  prompt={prompt}
                  setPrompt={setPrompt}
                  duration={duration}
                  setDuration={setDuration}
                />
              </div>
              <div className="mt-4 w-full px-8">
                <QuickPrompts
                  handlePrompt={(prompt) => setPrompt(prompt)}
                  disabled={false}
                  submitting={false}
                />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
