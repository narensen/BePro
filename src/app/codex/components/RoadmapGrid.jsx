'use client'

import ReactMarkdown from 'react-markdown';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/app/lib/supabase_client';
import useUserStore from '@/app/store/useUserStore';

export function SettingsCodex({}) {
  const [username, setUsername] = useState('')
}

export default function RoadmapGrid({ missions, username }) {
  if (!missions || Object.keys(missions).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm lg:text-base">No roadmap found.</p>
      </div>
    );

  }

  const handleDeleteRoadmap = async () => {
    const { error } = await supabase
    .from('codex')
    .delete()
    .eq('username', username);
    location.reload();
  }

  return (
    <div>
<div className="flex justify-end pr-4">
  <button className="flex items-center gap-2 border bg-red-600 border-red-300 text-white/80 rounded-lg p-2 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleDeleteRoadmap}>
    <Trash2 size={24} />
    </button>
</div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-10">
      {Object.entries(missions).map(([id, item]) => (
        <div
          key={id}
          className="group relative p-4 lg:p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-transform duration-500 ease-in-out cursor-pointer overflow-hidden min-h-[120px] lg:min-h-[150px]"
        >
          <h3 className="text-base lg:text-xl font-semibold text-white drop-shadow-sm group-hover:opacity-0 group-hover:scale-105 group-hover:translate-y-[-10px] transition-transform duration-300 leading-tight">
            <ReactMarkdown>{item.title.replace(/\\n/g, '')}</ReactMarkdown>
          </h3>

          <div className="absolute inset-0 p-4 lg:p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out z-10 rounded-xl overflow-y-auto">
            <div className='text-xs lg:text-sm text-white/90 leading-relaxed animate-fade-in-up'>
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}