'use client'

import ReactMarkdown from 'react-markdown';
import { SettingsIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsCodex({}) {
  
}

export default function RoadmapGrid({ missions }) {
  if (!missions || Object.keys(missions).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm lg:text-base">No roadmap found.</p>
      </div>
    );
  }

  return (
    <div>
<div className="flex justify-end pr-4">
  <div className="flex items-center gap-2 border bg-black border-black text-amber-400 rounded-lg p-2 hover:scale-105 transition-all duration-300 cursor-pointer">
    <SettingsIcon size={24} />
    <p className="text-sm">Settings</p>
  </div>
</div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-10">
      {Object.entries(missions).map(([id, item]) => (
        <div
          key={id}
          className="group relative p-4 lg:p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-transform duration-500 ease-in-out cursor-pointer overflow-hidden min-h-[120px] lg:min-h-[150px]"
        >
          <h3 className="text-base lg:text-xl font-semibold text-white drop-shadow-sm group-hover:opacity-0 group-hover:scale-105 group-hover:translate-y-[-10px] transition-transform duration-300 leading-tight">
            <ReactMarkdown>{item.title}</ReactMarkdown>
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