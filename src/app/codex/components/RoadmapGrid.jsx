'use client';

import { Trash2 } from 'lucide-react';
import React from 'react';

import { supabase } from '@/app/lib/supabase_client'

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
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm lg:text-base font-medium">No roadmap found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end pr-4">
        <button
          className="flex items-center gap-2 border bg-gradient-to-r from-red-600 to-red-700 border-red-300 text-white rounded-lg px-4 py-2 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer font-semibold"
          onClick={handleDeleteRoadmap}
        >
          <Trash2 size={20} />
          Delete Roadmap
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-10">
        {Object.entries(missions).map(([id, item]) => (
          <motion.div
            key={id}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedItem(item);
              setIsModalOpen(true);
            }}
            className="group p-6 lg:p-7 rounded-xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden min-h-[140px] lg:min-h-[170px] relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h3 className="text-base lg:text-xl font-bold text-white drop-shadow-lg leading-[1.6] relative z-10">
              <ReactMarkdown>{item.title.replace(/\\n/g, '')}</ReactMarkdown>
            </h3>
          </motion.div>
        ))}
      </div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #f59e0b #f3f4f6;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f59e0b, #d97706);
          border-radius: 6px;
          border: 2px solid #f3f4f6;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #d97706, #b45309);
        }
      `}</style>

      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pl-72 bg-black/70 backdrop-blur-lg flex items-center justify-center overflow-hidden px-4"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl p-10 w-full max-w-4xl relative max-h-[90vh] overflow-hidden border border-white/20"
              onClick={handleModalClick}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-t-2xl" />
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 rounded-full flex items-center justify-center transition-all duration-200 text-lg font-bold"
              >
                ✕
              </button>
              
              <h2 className="text-2xl lg:text-3xl font-black mb-8 pr-12 leading-[1.5] text-slate-900 dark:text-white">
                <ReactMarkdown>{selectedItem.title.replace(/\\n/g, '')}</ReactMarkdown>
              </h2>
              
              <div className="max-h-[60vh] text-lg lg:text-xl px-1 mb-6 overflow-y-auto custom-scrollbar">
                <div className="rounded-2xl bg-gradient-to-br from-slate-100/80 to-white/80 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm shadow-lg p-8 mb-8 border border-slate-200/50 dark:border-gray-600/30">
                  <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-200">
                    <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-slate-50 to-transparent dark:from-gray-800 pointer-events-none rounded-b-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}