"use client";


import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase_client";

const TABS = [
  { key: "train", label: "Train" },
  { key: "compete", label: "Compete" },
  { key: "help", label: "Help Others" },
  { key: "stats", label: "Community Stats" },
];

export default function FortressWelcomePage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    fortressAccess: 0,
    activeToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("train");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { count: totalUsers } = await supabase.from("profile").select("id", { count: "exact", head: true });
      const { count: verifiedUsers } = await supabase.from("profile").select("id", { count: "exact", head: true }).not("email_confirmed_at", "is", null);
      const { count: fortressAccess } = await supabase
        .from("fortress_verification")
        .select("id", { count: "exact", head: true })
        .eq("verified", true);
      const today = new Date();
      today.setHours(0,0,0,0);
      const { count: activeToday } = await supabase.from("profile").select("id", { count: "exact", head: true }).gte("last_login", today.toISOString());
      setStats({
        totalUsers: totalUsers ?? 0,
        verifiedUsers: verifiedUsers ?? 0,
        fortressAccess: fortressAccess ?? 0,
        activeToday: activeToday ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-sans relative">
      <div className="transition-all duration-300 ease-in-out min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white/95 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center mx-4">
          <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent text-center">Welcome to Fortress</h1>
          <p className="mb-6 text-base md:text-lg text-center text-gray-700 max-w-xl">You now have exclusive access to the Fortress. Choose your path below to train, compete, or help others!</p>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 w-full justify-center">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 border-2 ${tab === t.key ? 'bg-yellow-400 border-yellow-500 text-gray-900 shadow' : 'bg-white border-gray-200 text-gray-600 hover:bg-yellow-100'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="w-full">
            {tab === "train" && <TrainSection />}
            {tab === "compete" && <CompeteSection />}
            {tab === "help" && <HelpSection />}
            {tab === "stats" && <StatsSection stats={stats} loading={loading} />}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-8 w-full justify-center">
            <button onClick={() => setTab("train")}
              className="bg-black text-yellow-400 px-5 py-2 rounded-full font-bold shadow hover:bg-gray-900 transition-all">
              Start Training
            </button>
            <button onClick={() => setTab("compete")}
              className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold shadow hover:bg-yellow-500 transition-all">
              Join Competition
            </button>
            <button onClick={() => setTab("help")}
              className="bg-white border border-yellow-400 text-yellow-500 px-5 py-2 rounded-full font-bold shadow hover:bg-yellow-100 transition-all">
              Help Others
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainSection() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Training Arena</h2>
      <p className="text-gray-700 text-center max-w-md">Sharpen your skills with daily challenges, quizzes, and learning missions. Track your progress and earn badges as you train!</p>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Daily Quiz</span>
          <span className="text-gray-700 text-sm mb-3">Test your knowledge with a new quiz every day.</span>
          <button className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all">Start Quiz</button>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Skill Missions</span>
          <span className="text-gray-700 text-sm mb-3">Complete missions to level up your skills and unlock rewards.</span>
          <button className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all">View Missions</button>
        </div>
      </div>
    </div>
  );
}

function CompeteSection() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Competition Zone</h2>
      <p className="text-gray-700 text-center max-w-md">Join live competitions, climb the leaderboard, and win exclusive rewards. Compete with the best in the Fortress!</p>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <div className="bg-white border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Leaderboard</span>
          <span className="text-gray-700 text-sm mb-3">See who’s leading this week.</span>
          <button className="bg-black text-yellow-400 px-4 py-1 rounded-full font-bold hover:bg-gray-900 transition-all">View Leaderboard</button>
        </div>
        <div className="bg-white border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Upcoming Events</span>
          <span className="text-gray-700 text-sm mb-3">Register for the next big challenge.</span>
          <button className="bg-black text-yellow-400 px-4 py-1 rounded-full font-bold hover:bg-gray-900 transition-all">See Events</button>
        </div>
      </div>
    </div>
  );
}

function HelpSection() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Help the Community</h2>
      <p className="text-gray-700 text-center max-w-md">Mentor others, answer questions, and contribute to the growth of the Fortress community. Every bit of help counts!</p>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <div className="bg-white border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Answer Questions</span>
          <span className="text-gray-700 text-sm mb-3">Help others by sharing your knowledge.</span>
          <button className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all">Start Helping</button>
        </div>
        <div className="bg-white border border-yellow-300 rounded-xl p-4 w-64 flex flex-col items-center shadow">
          <span className="font-bold text-lg text-gray-900 mb-2">Become a Mentor</span>
          <span className="text-gray-700 text-sm mb-3">Guide new members and make a difference.</span>
          <button className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all">Become Mentor</button>
        </div>
      </div>
    </div>
  );
}

function StatsSection({ stats, loading }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Community Stats</h2>
      <p className="text-gray-700 text-center max-w-md">See how the Fortress community is growing and thriving!</p>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <StatCard label="Total Users" value={loading ? "-" : stats.totalUsers} />
        <StatCard label="Verified Members" value={loading ? "-" : stats.verifiedUsers} />
        <StatCard label="Fortress Access" value={loading ? "-" : stats.fortressAccess} />
        <StatCard label="Active Today" value={loading ? "-" : stats.activeToday} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white border border-yellow-300 rounded-xl p-4 shadow-sm">
      <div className="text-xl font-bold mb-1 text-black">{value}</div>
      <div className="text-sm font-medium text-gray-900/80 text-center">{label}</div>
    </div>
  );
}
