'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ConfirmationPage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/') // redirect home after 5 sec (optional)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [router])

  return (
    <main className="bg-yellow-400 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="bg-black text-yellow-400 p-10 rounded-2xl shadow-2xl max-w-xl w-full"
      >
        <motion.h1
          className="text-4xl font-extrabold mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          🎉 You're officially in!
        </motion.h1>
        <motion.p
          className="text-lg mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Thanks for joining the waitlist. We’re launching in <strong>45 days</strong> and you’ll be the first to know!
        </motion.p>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-sm text-yellow-300">Redirecting to homepage...</span>
        </motion.div>
      </motion.div>
    </main>
  )
}
