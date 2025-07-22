'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase_client';
import SideBar from '../components/SideBar';
import useUserStore from '../store/useUserStore';
import { Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import useLoadingStore from '../store/useLoadingStore';

// ========== Parser Function ==========
function parseRoadmapData(payload) {
  if (!payload) return {};
  
  // If already parsed object
  if (typeof payload === 'object' && payload !== null) {
    if (payload.missions) return payload.missions;
    return payload;
  }

  // Parse string data
  let cleaned = typeof payload === 'string' ? payload.trim() : JSON.stringify(payload);
  
  // Remove markdown code blocks and quotes
  cleaned = cleaned.replace(/^```[\w]*\s*/i, '').replace(/```\s*$/i, '');
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  const missions = {};
  const regex = /<MISSION_(\d+)>([\s\S]*?)<\/MISSION_\1>/gi;
  let match;

  while ((match = regex.exec(cleaned)) !== null) {
    const missionNumber = match[1];
    const content = match[2].trim();
    
    const titleMatch = content.match(/Title:\s*(.+?)(?:\n|Description:|$)/i);
    const descriptionMatch = content.match(/Description:\s*([\s\S]*?)(?:\n\n|$)/i);
    
    missions[missionNumber] = {
      title: titleMatch ? titleMatch[1].trim() : `Mission ${missionNumber}`,
      content: descriptionMatch ? descriptionMatch[1].trim().replace(/\\n/g, '\n') : content
    };
  }

  return Object.keys(missions).length > 0 ? missions : {};
}

// ========== Quick Prompts ==========
const quickPrompts = [
  "Create a roadmap to become a Full Stack Developer in 6 months",
  "How do I prepare for software engineering interviews?",
  "Build a career path for Data Science in 1 year",
  "What skills do I need for DevOps engineering?"
];

// ========== Duration Selector ==========
function DurationSelector({ value, setValue, disabled }) {
  const options = [
    { label: '1 Month', value: '1 month' },
    { label: '3 Months', value: '3 months' },
    { label: '6 Months', value: '6 months' },
    { label: '1 Year', value: '1 year' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => setValue(opt.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            value === opt.value
              ? 'bg-amber-400 text-white'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ========== Query Box ==========
function QueryBox({ onSubmit, disabled, submitting }) {
  const [input, setInput] = useState('');
  const [duration, setDuration] = useState('6 months');

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input, duration);
      setInput('');
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-xl border border-neutral-200"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <textarea
        className="w-full h-32 bg-neutral-900 text-white text-base px-4 py-3 rounded-xl resize-none focus:outline-none placeholder:text-neutral-400"
        placeholder="Start writing your Codex here..."
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={disabled || submitting}
      />
      
      <DurationSelector value={duration} setValue={setDuration} disabled={disabled || submitting} />
      
      <button
        className="w-full mt-4 px-6 py-3 bg-amber-400 text-white font-bold rounded-xl hover:bg-amber-500 disabled:opacity-60 transition"
        onClick={handleSubmit}
        disabled={disabled || submitting || !input.trim()}
      >
        {submitting ? "Creating..." : "Ask Codex"}
      </button>

      <div className="mt-4 space-y-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            className="w-full text-left px-3 py-2 text-sm bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 transition"
            onClick={() => setInput(prompt)}
            disabled={disabled || submitting}
          >
            {prompt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ========== Settings Menu ==========
function RoadmapSettings({ onDelete, deleting }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-neutral-100 transition"
      >
        <MoreVertical size={20} />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg"
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              onClick={() => setConfirm(true)}
            >
              <Trash2 size={16} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <div className="bg-white rounded-xl p-6 max-w-sm">
              <h3 className="text-lg font-bold text-red-700 mb-2">Delete Roadmap?</h3>
              <p className="text-neutral-600 mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  onClick={() => {
                    onDelete();
                    setConfirm(false);
                    setOpen(false);
                  }}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Delete"}
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition"
                  onClick={() => setConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========== Roadmap Display ==========
function RoadmapDisplay({ roadmap }) {
  const [activeIdx, setActiveIdx] = useState(0);
  
  if (!roadmap) return <div className="text-center p-8 text-amber-800">No roadmap data found.</div>;

  const parsed = parseRoadmapData(roadmap);
  const missions = Object.entries(parsed)
    .filter(([k]) => /^\d+$/.test(k))
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  if (missions.length === 0) {
    return <div className="text-center p-8 text-amber-800">No missions found. Please create a new roadmap.</div>;
  }

  const formatContent = (content) => {
    if (!content) return '';
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="w-full py-8">
      {/* Mission Steps */}
      <div className="flex justify-center items-center gap-4 mb-8 overflow-x-auto pb-4">
        {missions.map(([key, mission], idx) => (
          <div key={key} className="flex items-center flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition ${
                activeIdx === idx
                  ? 'bg-amber-400 border-amber-500 text-white shadow-lg'
                  : 'bg-white border-amber-300 text-amber-700 hover:border-amber-400'
              }`}
              onClick={() => setActiveIdx(idx)}
            >
              {key}
            </motion.button>
            {idx < missions.length - 1 && (
              <div className="w-8 h-0.5 bg-amber-300 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Active Mission Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-amber-200"
        >
          <h3 className="text-xl font-bold text-amber-800 mb-4">
            {missions[activeIdx][1].title}
          </h3>
          <div
            className="text-neutral-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatContent(missions[activeIdx][1].content)
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          className="px-4 py-2 bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 disabled:opacity-50 transition"
          onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
          disabled={activeIdx === 0}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 disabled:opacity-50 transition"
          onClick={() => setActiveIdx(Math.min(missions.length - 1, activeIdx + 1))}
          disabled={activeIdx === missions.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ========== Main Component ==========
const API_BASE = 'https://bepro-codex.onrender.com';

export default function Codex() {
  const { user, username: zustandUsername, clearUserSession } = useUserStore();
  const username = zustandUsername || user?.user_metadata?.username || 'user';
  const { loading: globalLoading, setLoading: setGlobalLoading } = useLoadingStore();

  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing roadmap
  useEffect(() => {
    async function fetchRoadmap() {
      if (!username) return;
      
      try {
        const { data, error } = await supabase
          .from('codex')
          .select('roadmap, created_at')
          .eq('username', username)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data?.roadmap) {
          setRoadmap(data.roadmap);
        }
      } catch (err) {
        console.error('Error fetching roadmap:', err);
        setError('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    }

    fetchRoadmap();
  }, [username]);

  // Create new roadmap
  const handleSubmit = async (input, duration) => {
    setGlobalLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/create-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: `${input}\nDuration: ${duration}`,
          context: "user query"
        })
      });

      const data = await response.text();
      
      // Store roadmap data
      const { error: upsertError } = await supabase
        .from('codex')
        .upsert([{
          username,
          roadmap: data,
          created_at: new Date().toISOString()
        }], {
          onConflict: 'username'
        });

      if (upsertError) throw upsertError;

      setRoadmap(data);
      setSuccess('Roadmap created successfully!');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create roadmap. Please try again.');
    } finally {
      setGlobalLoading(false);
    }
  };

  // Delete roadmap
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('codex')
        .delete()
        .eq('username', username);

      if (error) throw error;

      setRoadmap(null);
      setSuccess('Roadmap deleted successfully!');
    } catch (err) {
      setError('Failed to delete roadmap');
    } finally {
      setDeleting(false);
    }
  };

  // Auth check
  useEffect(() => {
    if (!user) {
      supabase.auth.getSession().then(({ data }) => {
        if (!data?.session) {
          clearUserSession();
          window.location.href = '/';
        }
      });
    }
  }, [user, clearUserSession]);

  if (globalLoading) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400">
      {/* Sidebar */}
      <div className="w-72 fixed top-0 left-0 h-full z-30">
        <SideBar
          user={user}
          username={username}
          onSignOut={async () => {
            await supabase.auth.signOut();
            clearUserSession();
            window.location.href = '/';
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-black mb-2">Welcome back, {username}!</h1>
            <p className="text-xl text-black/70">Get personalized roadmaps and career guidance.</p>
          </motion.div>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-amber-600" size={40} />
            </div>
          ) : roadmap ? (
            <motion.div
              className="relative bg-amber-50 rounded-2xl p-6 shadow-xl border border-amber-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <RoadmapSettings onDelete={handleDelete} deleting={deleting} />
              <h2 className="text-2xl font-bold text-amber-900 mb-6">Your Learning Roadmap</h2>
              <RoadmapDisplay roadmap={roadmap} />
            </motion.div>
          ) : (
            <div className="flex justify-center">
              <QueryBox
                onSubmit={handleSubmit}
                disabled={globalLoading}
                submitting={globalLoading}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}