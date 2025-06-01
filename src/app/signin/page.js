'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase_client'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Signed in successfully!')
      router.push('/') // change this to wherever you wanna redirect
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-400 text-black px-4">
      {/* Animated Heading */}
      <motion.h1
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.7,
          ease: [0.68, -0.55, 0.265, 1.55],
        }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight"
      >
        Welcome Back 👋
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
        className="mt-3 text-lg md:text-xl text-black/80"
      >
        Sign in to BePro and power your career.
      </motion.p>

      {/* Sign In Form */}
      <div className="w-full max-w-md mt-10 bg-white/80 rounded-2xl p-6 shadow-xl backdrop-blur">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-semibold py-2 rounded hover:bg-gray-900 transition-all duration-300"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {message && (
            <p className="text-center text-sm font-medium mt-2">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
