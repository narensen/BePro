'use client'

import { motion } from 'framer-motion'

export default function LoadingSection() {
  return (
    <div
      className="mt-8 flex flex-col items-center justify-center"
      role="status"
      aria-label="Loading content"
    >
      <motion.div
        className="w-10 h-10 lg:w-14 lg:h-14 border-[2px] border-t-black rounded-full"
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
