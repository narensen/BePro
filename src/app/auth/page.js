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
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isSendingReset, setIsSendingReset] = useState(false)

  const router = useRouter()

  

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignIn) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) setMessage(error.message)
      else setMessage('Signed in successfully!')
      router.push('/waitlist')
    } else {
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
      else {
        setMessage("Account created! BePro will launch on August 3 2025.")
        router.push('/confirm-email')
      }
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setMessage('Please enter your email.')
      return
    }

    setLoading(true)
    setIsSendingReset(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'https://bepro.live/update-password'
    })
    setLoading(false)
    setIsSendingReset(false)

    if (error) setMessage(error.message)
    else {
      setMessage('Password reset email sent! Check your inbox.')
      setShowReset(false)
    }
  }

  const renderHeader = () => {
    if (showReset) {
      return (
        <div className="w-full flex justify-start mb-6">
          <span
            className="text-2xl font-semibold cursor-pointer hover:opacity-70 transition"
            onClick={() => { setShowReset(false); setIsSignIn(true); setMessage('') }}
          >
            ← Back
          </span>
        </div>
      )
    }

    return (
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => { setIsSignIn(true); setShowReset(false); }}
          className={`px-4 py-2 rounded font-semibold ${isSignIn ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setIsSignIn(false); setShowReset(false); }}
          className={`px-4 py-2 rounded font-semibold ${!isSignIn ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
        >
          Sign Up
        </button>
      </div>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-400 text-black px-4">
      <motion.h1
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.68, -0.55, 0.265, 1.55] }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight"
      >
        {showReset
          ? 'Reset Your Password 🔐'
          : isSignIn
            ? 'Welcome Back 👋'
            : 'Create an Account 🚀'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
        className="mt-3 text-lg md:text-xl text-black/80"
      >
        {showReset
          ? 'We’ll send you a reset link.'
          : isSignIn
            ? 'Sign in to BePro and power your career.'
            : 'Join BePro. Launching Aug 3 2025.'}
      </motion.p>

      <div className="w-full max-w-md mt-10 bg-white/80 rounded-2xl p-6 shadow-xl backdrop-blur">
        {renderHeader()}

        {showReset ? (
          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
            />
            <button
              onClick={handleResetPassword}
              className="bg-yellow-500 text-black font-semibold py-2 rounded hover:bg-yellow-600 transition-all duration-300 cursor-pointer"
            >
              {isSendingReset ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isSignIn && (
              <>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600" />
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600" />
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600" />
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600" />
              </>
            )}

            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600" />

            {isSignIn && (
              <div className="text-right">
                <span
                  onClick={() => { setShowReset(true); setMessage('') }}
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </span>
              </div>
            )}

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
          </form>
        )}

        {message && (
          <p className="text-center text-sm font-medium mt-2">{message}</p>
        )}
      </div>
    </main>
  )
}
