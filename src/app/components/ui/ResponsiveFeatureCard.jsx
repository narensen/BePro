'use client';

import { useState } from 'react';
import { useOnScreen } from '@/app/hooks/useOnScreen';

export default function ResponsiveFeatureCard({ icon, title, description, delay = 0 }) {
  const [ref, isVisible] = useOnScreen();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      ref={ref} 
      className={`relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/20 transition-all duration-700 hover:scale-105 hover:border-amber-400/50 group cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`} 
      style={{ transitionDelay: `${delay}ms` }} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
      <div className="relative z-10">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="relative">
            {icon}
            {isHovered && <div className="absolute inset-0 animate-ping">{icon}</div>}
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">{title}</h3>
        <p className="text-black/80 text-center leading-relaxed text-sm sm:text-base">{description}</p>
      </div>
    </div>
  );
}