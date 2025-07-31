'use client'

import { motion } from 'framer-motion'

export default function LoadingSection() {
  return (
    <div
      className="mt-36 flex flex-col items-center justify-center"
      role="status"
      aria-label="Loading content"
    >
      <motion.div
        className="w-10 h-10 lg:w-14 lg:h-14 border-[4px] border-t-amber-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: 'linear',
        }}
      />
      <p className="mt-4 text-black font-medium text-sm lg:text-base">Loading...</p>
    </div>
  );
}
