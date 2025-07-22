'use client'

import { motion } from "framer-motion";
import { supabase } from "../lib/supabase_client";
import useUserStore from "../store/useUserStore";
import SideBar from "../components/SideBar";
import QueryBox from "./components/QueryBox";
import QuickPrompts from "./components/QuickPrompts";
import { useState } from "react";



export default function Codex() {
  const { user, username } = useUserStore();
  const upper_User = username.charAt(0).toUpperCase() + username.slice(1);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("");


  const checkUserRoadmap = async (username) => {
    const {data, error} = await supabase
    .from('codex')
    .select('username')
    .eq('username', username)
    .single();

    if (error) {
      return false;
    }

    return !!data;
  }


  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
    else location.reload();
  };

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
        </motion.div>

        <QueryBox prompt={prompt} setPrompt={setPrompt} duration={duration} setDuration={setDuration} />
        <div className="mt-4">
        <QuickPrompts className="mt-16" handlePrompt={(prompt) => setPrompt(prompt)} disabled={false} submitting={false} />
        </div>
      </div>
    </div>
  );
}