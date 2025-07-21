'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase_client';
import SideBar from '../components/SideBar';
import useUserStore from '../store/useUserStore';
import { Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import useLoadingStore from '../store/useLoadingStore';

function parseTaggedResponse(payload) {
  console.log('Parsing payload:', typeof payload, payload);
  
  if (typeof payload === 'object' && payload !== null) {
    if (payload.missions) return payload.missions;
    if (Object.keys(payload).some(k => /^\d+$/.test(k))) return payload;
    payload = JSON.stringify(payload);
  }

  if (typeof payload !== 'string') return {};

  let cleaned = payload.trim();
  
  // Remove outer quotes if present
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  // Remove possible markdown code blocks
  cleaned = cleaned.replace(/^```[\w]*\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/i, '');

  // Handle escaped quotes and newlines that might be in the stored string
  cleaned = cleaned.replace(/\\"/g, '"');
  cleaned = cleaned.replace(/\\'/g, "'");

  const missions = {};
  
  // More flexible regex that allows for extra whitespace and characters around tags
  // This will match even if there are quotes, spaces, or other characters around the tags
  const missionRegex = /.*?<MISSION_(\d+)>\s*([\s\S]*?)\s*<\/MISSION_\1>.*/gi;
  
  // Alternative approach: find all MISSION tags more flexibly
  const flexibleRegex = /<MISSION_(\d+)>([\s\S]*?)<\/MISSION_\1>/gi;
  let match;
  let foundAny = false;

  // Reset regex lastIndex
  flexibleRegex.lastIndex = 0;
  
  while ((match = flexibleRegex.exec(cleaned)) !== null) {
    foundAny = true;
    const missionNumber = match[1];
    const content = match[2].trim();
    
    console.log(`Found mission ${missionNumber}:`, content.substring(0, 50) + '...');
    
    // Extract title and description
    const titleMatch = content.match(/Title:\s*(.+?)(?:\n|Description:|$)/i);
    const descriptionMatch = content.match(/Description:\s*([\s\S]*?)(?:\n\n(?:Key Objectives:|<)|$)/i);
    
    const title = titleMatch ? titleMatch[1].trim() : `Mission ${missionNumber}`;
    let description = descriptionMatch ? descriptionMatch[1].trim() : content;
    
    // Clean up the description
    description = description
      .replace(/\\n/g, '\n')  // Replace escaped newlines
      .replace(/\\\\/g, '\\') // Replace double backslashes
      .trim();
    
    missions[missionNumber] = {
      title: title,
      content: description
    };
  }

  if (foundAny) {
    console.log('Successfully parsed missions:', Object.keys(missions));
    return missions;
  }

  // If the regex approach didn't work, try a more manual approach
  console.log('Regex approach failed, trying manual parsing...');
  
  // Look for mission patterns manually
  const lines = cleaned.split('\n');
  let currentMission = null;
  let currentContent = [];
  
  for (const line of lines) {
    const missionStart = line.match(/<MISSION_(\d+)>/);
    const missionEnd = line.match(/<\/MISSION_(\d+)>/);
    
    if (missionStart) {
      // Save previous mission if exists
      if (currentMission && currentContent.length > 0) {
        const fullContent = currentContent.join('\n').trim();
        const titleMatch = fullContent.match(/Title:\s*(.+?)(?:\n|Description:|$)/i);
        const descriptionMatch = fullContent.match(/Description:\s*([\s\S]*?)(?:\n\n(?:Key Objectives:|<)|$)/i);
        
        missions[currentMission] = {
          title: titleMatch ? titleMatch[1].trim() : `Mission ${currentMission}`,
          content: descriptionMatch ? descriptionMatch[1].trim().replace(/\\n/g, '\n') : fullContent
        };
      }
      
      currentMission = missionStart[1];
      currentContent = [];
    } else if (missionEnd) {
      // End current mission
      if (currentMission && currentContent.length > 0) {
        const fullContent = currentContent.join('\n').trim();
        const titleMatch = fullContent.match(/Title:\s*(.+?)(?:\n|Description:|$)/i);
        const descriptionMatch = fullContent.match(/Description:\s*([\s\S]*?)(?:\n\n(?:Key Objectives:|<)|$)/i);
        
        missions[currentMission] = {
          title: titleMatch ? titleMatch[1].trim() : `Mission ${currentMission}`,
          content: descriptionMatch ? descriptionMatch[1].trim().replace(/\\n/g, '\n') : fullContent
        };
      }
      currentMission = null;
      currentContent = [];
    } else if (currentMission) {
      currentContent.push(line);
    }
  }
  
  console.log('Manual parsing result:', Object.keys(missions));
  return missions;
}
// ========== QuickPrompts ==========
const quickPrompts = [
  "Create a roadmap to become a Full Stack Developer in 6 months",
  "How do I prepare for software engineering interviews?",
  "What are the latest trends in AI and Machine Learning?",
  "Build a career path for Data Science in 1 year",
  "What skills do I need for DevOps engineering?",
  "Create a learning plan for React and Node.js"
];

// ========== DurationSelector Component ==========
function DurationSelector({ value, setValue, disabled }) {
  const options = [
    { label: '1 Month', value: '1 month' },
    { label: '3 Months', value: '3 months' },
    { label: '6 Months', value: '6 months' },
    { label: '1 Year', value: '1 year' },
    { label: '2 Years', value: '2 years' },
    { label: 'Custom', value: 'custom' }
  ];
  return (
    <div className="flex flex-wrap gap-3 mt-4 mb-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => setValue(opt.value)}
          className={`
            px-4 py-2 rounded-lg font-semibold
            ${value === opt.value
              ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-white shadow'
              : 'bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-200 text-amber-900 hover:bg-amber-200'}
            transition
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ========== QueryBox Component ==========
function QueryBox({ onSubmit, disabled, submitting }) {
  const [input, setInput] = useState('');
  const [duration, setDuration] = useState('6 months');
  const [customDuration, setCustomDuration] = useState('');

  const handlePrompt = (prompt) => setInput(prompt);

  function submit() {
    let dur = duration === 'custom' ? customDuration : duration;
    onSubmit(input, dur);
    setInput('');
    setCustomDuration('');
  }

  return (
    <motion.div
      className="w-full max-w-2xl p-6 flex flex-col gap-4 bg-white rounded-2xl shadow-xl border border-neutral-200"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, type: "spring", stiffness: 130 }}
    >
      <textarea
        className="w-full h-32 bg-neutral-900 text-white text-base px-4 py-3 rounded-xl resize-none focus:outline-none placeholder:text-neutral-400"
        placeholder="Start writing your Codex here..."
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={disabled || submitting}
        spellCheck={false}
      />
      <DurationSelector
        value={duration}
        setValue={setDuration}
        disabled={disabled || submitting}
      />
      {duration === 'custom' && (
        <input
          type="text"
          className="w-40 mt-2 px-3 py-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Enter custom duration"
          value={customDuration}
          onChange={e => setCustomDuration(e.target.value)}
          disabled={disabled || submitting}
        />
      )}
      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.04, boxShadow: "0 4px 32px 0 rgba(255, 193, 7, .09)" }}
        className={`rounded-xl px-6 py-2 font-bold text-white shadow-md bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600
          hover:scale-105 transition-all active:scale-95 disabled:opacity-60`}
        onClick={submit}
        disabled={disabled || submitting || !input.trim() || (duration === 'custom' && !customDuration.trim())}
        type="button"
      >
        {submitting ? "Submitting..." : "Ask Codex"}
      </motion.button>
      <motion.div
        className="flex flex-col gap-2 mt-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {quickPrompts.map((prompt, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left rounded-lg px-4 py-2 bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-200 text-amber-900 font-mono font-semibold shadow hover:bg-amber-100 transition"
            onClick={() => handlePrompt(prompt)}
            disabled={disabled || submitting}
            type="button"
            style={{ transition: 'background 0.3s' }}
          >
            {prompt}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ========== RoadmapSettings Component ==========
function RoadmapSettings({ onDelete, deleting }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="absolute top-5 right-5 z-20">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-neutral-100 transition"
        title="Roadmap Settings"
      >
        <MoreVertical size={24} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl"
          >
            <button
              className="flex items-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-xl transition"
              onClick={() => setConfirm(true)}
              disabled={deleting}
            >
              <Trash2 size={18} /> Delete Roadmap
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirmation dialog */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
          >
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-5 shadow-xl border border-neutral-200">
              <span className="text-lg font-semibold text-red-700">Delete this roadmap?</span>
              <p className="text-neutral-700 text-center">This cannot be undone.</p>
              <div className="flex gap-3 mt-3">
                <button
                  className="px-5 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
                  onClick={() => {
                    onDelete();
                    setConfirm(false);
                    setOpen(false);
                  }}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="inline mr-1 animate-spin" size={18} /> : "Delete"}
                </button>
                <button
                  className="px-5 py-2 rounded-lg bg-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-300 transition"
                  onClick={() => setConfirm(false)}
                  disabled={deleting}
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

// ========== RoadmapAngryBirds Component ==========
// Render markdown, convert \n and \\n to <br>
function markdownToHTML(md) {
  if (!md) return '';
  // Replace markdown headers, bold, italics, links, and line breaks
  let html = md
    .replace(/^### (.*)$/gm, '<h3 class="font-bold text-amber-800 mb-2">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="font-bold text-amber-800 mb-3 text-lg">$1</h2>')
    .replace(/^\* (.*)$/gm, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-amber-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="text-blue-600 underline hover:text-blue-800" target="_blank">$1</a>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return html;
}

// Fixed RoadmapAngryBirds component with proper spacing
function RoadmapAngryBirds({ roadmap }) {
  const [openIdx, setOpenIdx] = useState(0);
  if (!roadmap) return null;
  let parsed = roadmap;
  // Parse the tagged format or existing object
  if (typeof roadmap !== 'object' || roadmap === null) {
    parsed = parseTaggedResponse(roadmap);
  } else if (typeof roadmap === 'object') {
    // Check if it's already in the new format or old JSON format
    if (!parsed.missions && Object.keys(parsed).some(k => /^[1-6]$/.test(k))) {
      // Old format, use as is
    } else if (parsed.missions) {
      parsed = parsed.missions;
    } else {
      parsed = parseTaggedResponse(JSON.stringify(roadmap));
    }
  }

  // Get mission entries and sort them
  const missions = Object.entries(parsed)
    .filter(([k]) => /^\d+$/.test(k))
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  

  if (missions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-amber-800">No missions found in roadmap. Please try generating a new one.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full py-16 overflow-x-auto">
      {/* Ensure minimum width based on number of missions */}
      <div className="min-w-max mx-auto">
        <motion.div
          className={`flex items-center justify-center gap-16 relative`}
          style={{ minWidth: `${missions.length * 200}px` }} // Ensure enough space
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } }
          }}
        >
          {missions.map(([key, val], idx) => (
            <motion.div
              key={key}
              className="flex flex-col items-center relative z-10 flex-shrink-0"
              style={{ minWidth: '150px' }} // Ensure minimum width per mission
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 130 }}
            >
              {/* Arrow/line to next */}
              {idx < missions.length - 1 && (
                <motion.div
                  className="absolute left-full top-1/2 -translate-y-1/2 w-16 h-2 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full shadow-md z-0"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: (idx + 1) * 0.12 }}
                  style={{ transformOrigin: 'left' }}
                />
              )}
              
              {/* Level Node */}
              <motion.button
                initial={{ scale: 0.9, y: 20, opacity: 0.5 }}
                animate={{ 
                  scale: openIdx === idx ? 1.09 : 1, 
                  y: openIdx === idx ? -15 : 0, 
                  opacity: 1 
                }}
                whileHover={{ 
                  scale: 1.12, 
                  y: -22, 
                  boxShadow: '0 8px 24px 0 rgba(255, 193, 7, .11)' 
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                className={`
                  mb-2 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-amber-400 bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-200
                  focus:outline focus:ring-amber-400/60 ring-2
                  cursor-pointer transition relative z-10
                  ${openIdx === idx ? 'ring-amber-500' : ''}
                `}
                onClick={() => setOpenIdx(idx)}
                tabIndex={0}
                title={val.title || `Mission ${key}`}
              >
                {key}
              </motion.button>
              
              {/* Title below node */}
              <span className="mt-2 text-center text-base font-bold text-amber-900 max-w-[8rem] leading-tight">
                {(val.title || `Mission ${key}`).split(":")[0]}
              </span>
              
              {/* Content for active node */}
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    key={key + '-content'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute left-1/2 -translate-x-1/2 -top-80 w-96 p-6 bg-white rounded-2xl shadow-2xl border-2 border-amber-300 z-30"
                    style={{ minWidth: 300, maxWidth: 400 }}
                  >
                    <h3 className="font-bold text-amber-800 mb-3 text-lg">
                      {val.title || `Mission ${key}`}
                    </h3>
                    <div
                      className="prose prose-amber max-w-none text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: markdownToHTML(val.content || '') }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ========== Main Codex Page ==========
const API_BASE = 'https://bepro-codex.onrender.com';

export default function Codex() {
  const { user, username: zustandUsername, clearUserSession } = useUserStore();
  const username = zustandUsername || user?.user_metadata?.username || 'user';

  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapDate, setRoadmapDate] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [today, setToday] = useState('');
  const { loading: globalLoading, setLoading: setGlobalLoading } = useLoadingStore();

  // --- Utility: get YYYY-MM-DD string ---
  const todayStr = () => new Date().toISOString().slice(0, 10);

  // --- On mount: check for existing roadmap for today ---
  useEffect(() => {
    setLoading(true);
    setToday(todayStr());
    async function fetchRoadmap() {
      const { data } = await supabase
        .from('codex')
        .select('roadmap, created_at')
        .eq('username', username)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data && data.roadmap) {
        setRoadmap(data.roadmap);
        setRoadmapDate(data.created_at ? data.created_at.slice(0, 10) : null);
      } else {
        setRoadmap(null);
        setRoadmapDate(null);
      }
      setLoading(false);
    }
    if (username) fetchRoadmap();
    else setLoading(false);
  }, [username]);

  // --- Submit handler: create roadmap via API if allowed ---
  async function handleSubmit(input, duration) {
    setGlobalLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const user_input = input + `\nDuration: ${duration}`;
      const response = await fetch(`${API_BASE}/create-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ user_input, context: "user query" })
      });

      let data;
      if (response.headers.get('content-type')?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = parseTaggedResponse(text);
      }

      // Save to supabase - store the parsed missions or raw data
      const roadmapToStore = typeof data === 'string' ? data : JSON.stringify(data);
      const { error: upsertError } = await supabase
        .from('codex')
        .upsert([
          { username, roadmap: roadmapToStore, created_at: new Date().toISOString() }
        ], { onConflict: ['username'] });
      
      if (upsertError) throw new Error(upsertError.message);
      
      setRoadmap(data);
      setRoadmapDate(todayStr());
      setSuccessMsg("Roadmap created!");
    } catch (err) {
      console.error('Error creating roadmap:', err);
      setError('Failed to create roadmap. Please try again.');
    }
    setGlobalLoading(false);
  }

  // --- Delete roadmap from supabase ---
  async function handleDelete() {
    setDeleting(true);
    setError('');
    setSuccessMsg('');
    try {
      const { error: delError } = await supabase
        .from('codex')
        .delete()
        .eq('username', username);
      if (delError) throw new Error(delError.message);
      setRoadmap(null);
      setRoadmapDate(null);
      setSuccessMsg("Roadmap deleted.");
    } catch (err) {
      setError('Failed to delete roadmap. Please try again.');
    }
    setDeleting(false);
  }

  // --- Auth/session redirect if not logged in ---
  useEffect(() => {
    if (!user) {
      supabase.auth.getSession().then(({ data }) => {
        if (!data?.session) {
          clearUserSession();
          window.location.href = '/';
        }
      });
    }
    // eslint-disable-next-line
  }, [user, clearUserSession]);

  // --- UI ---
  const hasTodayRoadmap = roadmap && roadmapDate === today;

  return (
    <div className="flex font-mono bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen">
      {/* Sidebar */}
      <div className="w-72 gradient-primary font-mono fixed top-0 left-0 h-full z-30">
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
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen ml-72 px-6">
        
        {globalLoading ? (
          <LoadingScreen />
        ) : (
          <>
            <motion.div
              className="max-w-2xl w-full mx-auto mt-14"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.7, type: "spring", stiffness: 120 }}
            >
              <h2 className="text-4xl font-extrabold text-black mb-1">Welcome back, {username}!</h2>
              <p className="text-xl text-black/70 mb-8">
                Get personalized roadmaps, career answers, and learning plans.
              </p>
              <div className="mt-12 bg-amber-100/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-300 mb-12">
          <p className="text-amber-900 font-medium">
            <strong className="text-amber-700">Pro Tip:</strong> The more specific your goal, the better your roadmap will be!
          </p>
        </div>
            </motion.div>
            {loading ? (
              <div className="w-full flex justify-center items-center h-80">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : hasTodayRoadmap ? (
              <motion.div
                className="relative w-full max-w-4xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, type: 'spring', stiffness: 110 }}
              >
                <RoadmapSettings onDelete={handleDelete} deleting={deleting} />
                <motion.div
                  className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-black text-amber-900 mb-4">Your Roadmap for Today</h2>
                  <RoadmapAngryBirds roadmap={roadmap} />
                  {successMsg && <div className="mt-4 text-green-700">{successMsg}</div>}
                  {error && <div className="mt-4 text-red-700">{error}</div>}
                </motion.div>
              </motion.div>
            ) : (
              <QueryBox
                onSubmit={handleSubmit}
                disabled={globalLoading || hasTodayRoadmap}
                submitting={globalLoading}
              />
            )}
          </>
        )}

      </main>
    </div>
  );
}