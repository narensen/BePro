'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase_client'

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignIn) {
      // Sign In with email + password
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) setMessage(error.message)
      else {
        setMessage('Signed in successfully!')
        
      }
    } else {
      // Sign Up with user_metadata
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            first_name: firstName,
            last_name: lastName,
            dob,
          },
        },
      })

      setLoading(false)
      if (error) setMessage(error.message)
      else setMessage("Account created! BePro will launch in 45 days.")
    router.push('/confirm-email')
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-400 text-black px-4">
      <motion.h1
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.68, -0.55, 0.265, 1.55] }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight"
      >
        {isSignIn ? 'Welcome Back 👋' : 'Create an Account 🚀'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
        className="mt-3 text-lg md:text-xl text-black/80"
      >
        {isSignIn
          ? 'Sign in to BePro and power your career.'
          : 'Join BePro. Launching in 45 days.'}
      </motion.p>

      <div className="w-full max-w-md mt-10 bg-white/80 rounded-2xl p-6 shadow-xl backdrop-blur">
        {/* Toggle */}
        <div className="flex justify-center mb-6 gap-4">
          <button
            onClick={() => setIsSignIn(true)}
            className={`px-4 py-2 rounded font-semibold ${
              isSignIn ? 'bg-black text-white' : 'bg-gray-200 text-black'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignIn(false)}
            className={`px-4 py-2 rounded font-semibold ${
              !isSignIn ? 'bg-black text-white' : 'bg-gray-200 text-black'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isSignIn && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
              />
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-semibold py-2 rounded hover:bg-gray-900 transition-all duration-300"
          >
            {loading
              ? isSignIn
                ? 'Signing in...'
                : 'Creating account...'
              : isSignIn
              ? 'Sign In'
              : 'Sign Up'}
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
