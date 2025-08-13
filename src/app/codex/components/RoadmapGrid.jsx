'use client';

import { Trash2 } from 'lucide-react';
import React from 'react';

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReactMarkdown = ({ children }) => {
  const formatText = (text) => {
    return text
      .split('\n\n')
      .map((paragraph, index) => (
        <p key={index} className="mb-6 last:mb-0 leading-[1.8] font-medium">
          {paragraph.split('\n').map((line, lineIndex, array) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < array.length - 1 && <br className="mb-2" />}
            </React.Fragment>
          ))}
        </p>
      ));
  };

  return <div className="space-y-2">{formatText(children)}</div>;
};

export default function RoadmapGrid({ missions, username }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteRoadmap = async () => {
    const { error } = await supabase
      .from('codex')
      .delete()
      .eq('username', username);

    if (error) {
      console.error('Error deleting roadmap:', error.message);
    } else {
      location.reload();
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const handleEscKey = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener('keydown', handleEscKey);
    } else {
      window.removeEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen, handleEscKey]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!missions || Object.keys(missions).length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6 opacity-50">
          <span className="text-8xl">🗺️</span>
        </div>
        <p className="text-muted-foreground text-xl lg:text-2xl font-semibold mb-2">No roadmap found.</p>
        <p className="text-muted-foreground/70 text-lg">Create your first roadmap to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end pr-4 mb-8">
        <button
          className="group flex items-center gap-3 bg-gradient-to-r from-destructive/90 to-destructive border border-destructive/50 text-destructive-foreground rounded-xl px-6 py-3 hover:scale-105 hover:shadow-xl hover:shadow-destructive/25 transition-all duration-300 cursor-pointer font-bold text-lg backdrop-blur-lg"
          onClick={handleDeleteRoadmap}
        >
          <Trash2 size={20} className="group-hover:scale-110 transition-transform duration-200" />
          Delete Roadmap
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12">
        {Object.entries(missions).map(([id, item], index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedItem(item);
              setIsModalOpen(true);
            }}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-card/80 via-card/60 to-accent/10 backdrop-blur-lg border border-border/50 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 ease-out cursor-pointer overflow-hidden min-h-[180px] lg:min-h-[200px]"
          >
            {/* Animated background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-chart-1/5 to-chart-2/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl" />
            
            {/* Subtle border glow animation */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-transparent via-primary/20 to-transparent" 
                 style={{background: 'linear-gradient(45deg, transparent 30%, var(--primary) 50%, transparent 70%)', 
                        backgroundSize: '200% 200%', 
                        animation: 'shimmer 3s ease-in-out infinite'}} />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
              <h3 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-primary leading-[1.6] transition-colors duration-300 flex-1">
                <ReactMarkdown>{item.title.replace(/\\n/g, '')}</ReactMarkdown>
              </h3>
              
              {/* Hover indicator */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-muted-foreground/60 text-sm font-medium group-hover:text-primary/80 transition-colors duration-300">
                  Click to view details
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <span className="text-primary text-sm">→</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 200%; }
          50% { background-position: 0% 50%; }
          100% { background-position: 200% 200%; }
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--primary)) hsl(var(--muted));
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--chart-1)));
          border-radius: 6px;
          border: 2px solid hsl(var(--muted));
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, hsl(var(--chart-1)), hsl(var(--chart-2)));
        }
      `}</style>

      <AnimatePresence>
        {isModalOpen && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 pl-72 bg-black/80 backdrop-blur-xl flex items-center justify-center overflow-hidden px-4"
              onClick={handleBackdropClick}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-gradient-to-br from-card via-card/95 to-accent/5 text-foreground rounded-3xl shadow-2xl p-12 w-full max-w-4xl relative max-h-[90vh] overflow-hidden border border-border/50 backdrop-blur-xl"
                onClick={handleModalClick}
              >
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-chart-1 to-chart-2 rounded-t-3xl shadow-lg" />
                
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 w-10 h-10 bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive/80 rounded-full flex items-center justify-center transition-all duration-200 text-xl font-bold shadow-lg hover:scale-110"
                >
                  ✕
                </button>
                
                <h2 className="text-3xl lg:text-4xl font-black mb-10 pr-16 leading-[1.4] bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  <ReactMarkdown>{selectedItem.title.replace(/\\n/g, '')}</ReactMarkdown>
                </h2>
                
                <div className="max-h-[60vh] text-lg lg:text-xl px-2 mb-8 overflow-y-auto custom-scrollbar">
                  <div className="rounded-3xl bg-gradient-to-br from-muted/50 via-muted/30 to-accent/10 backdrop-blur-sm shadow-xl p-10 mb-8 border border-border/30">
                    <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed">
                      <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-card to-transparent pointer-events-none rounded-b-3xl" />
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}