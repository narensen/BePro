'use client';

import ReactMarkdown from 'react-markdown';
import { Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/app/lib/supabase_client';

export default function RoadmapGrid({ missions, username }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete roadmap
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

  // Scroll lock
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

  // ESC key to close modal
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

  if (!missions || Object.keys(missions).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm lg:text-base">No roadmap found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Delete Button */}
      <div className="flex justify-end pr-4">
        <button
          className="flex items-center gap-2 border bg-red-600 border-red-300 text-white/80 rounded-lg p-2 hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={handleDeleteRoadmap}
        >
          <Trash2 size={24} />
          Delete Roadmap
        </button>
      </div>

      {/* Grid Display */}
      <div className="font-bold grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-10">
        {Object.entries(missions).map(([id, item]) => (
          <div
            key={id}
            onClick={() => {
              setSelectedItem(item);
              setIsModalOpen(true);
            }}
            className="p-4 lg:p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-transform duration-500 ease-in-out cursor-pointer overflow-hidden min-h-[120px] lg:min-h-[150px]"
          >
            <h3 className="text-base lg:text-xl font-semibold text-white drop-shadow-sm">
              <ReactMarkdown>{item.title.replace(/\\n/g, '')}</ReactMarkdown>
            </h3>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pl-72 bg-black/60 backdrop-blur-md flex items-center justify-center overflow-hidden px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-amber-300 dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-2xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 hover:text-red-500 dark:hover:text-red-400 transition text-xl font-bold"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">
                <ReactMarkdown>{selectedItem.title.replace(/\\n/g, '')}</ReactMarkdown>
              </h2>
              <div className="max-h-[60vh] text-sm lg:text-base pr-2 mb-4">
                <div className='rounded-xl bg-white/30 backdrop-blur-md shadow-lg overflow-y-auto p-4 mb-4'>
                <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
