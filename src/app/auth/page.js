'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '../lib/supabase_client'
import { useRouter } from 'next/navigation'

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
  const [messageType, setMessageType] = useState('') // 'success', 'error', 'info'
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isSendingReset, setIsSendingReset] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      if (isSignIn) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          setMessage(error.message)
          setMessageType('error')
        } else {
          setMessage('Welcome back! 🎉')
          setMessageType('success')
          // Redirect after successful sign in
          setTimeout(() => {
            router.push('/waitlist')
          }, 1500)
        }
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              first_name: firstName,
              last_name: lastName,
              date_of_birth: dob,
              full_name: `${firstName} ${lastName}`
            }
          }
        })

        if (error) {
          setMessage(error.message)
          setMessageType('error')
        } else {
          if (data.user && !data.user.email_confirmed_at) {
            setMessage('Check your email to confirm your account! 📧')
            setMessageType('info')
          } else {
            setMessage('Account created! BePro launches Aug 3, 2025 🚀')
            setMessageType('success')
            // Redirect after successful sign up
            setTimeout(() => {
              router.push('/confirm-email')
            }, 1500)
          }
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setMessage('Please enter your email.')
      setMessageType('error')
      return
    }

    setIsSendingReset(true)
    setMessage('')
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/update-password`
      })

      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        setMessage('Password reset email sent! Check your inbox 📧')
        setMessageType('success')
        setShowReset(false)
        setResetEmail('')
      }
    } catch (error) {
      setMessage('Failed to send reset email. Please try again.')
      setMessageType('error')
    } finally {
      setIsSendingReset(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  // Floating geometric shapes
  const floatingShapes = Array.from({ length: 15 }, (_, i) => (
    <motion.div
      key={i}
      className={`absolute ${
        i % 3 === 0 ? 'w-4 h-4 bg-black/10 rounded-full' :
        i % 3 === 1 ? 'w-3 h-3 bg-black/5 rotate-45' :
        'w-2 h-6 bg-black/10 rounded-full'
      }`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: "easeInOut"
      }}
    />
  ))

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingShapes}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/50 to-yellow-300/30"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(253, 224, 71, 0.5) 0%, rgba(250, 204, 21, 0.3) 100%)",
              "linear-gradient(135deg, rgba(250, 204, 21, 0.3) 0%, rgba(253, 224, 71, 0.5) 100%)",
              "linear-gradient(45deg, rgba(253, 224, 71, 0.5) 0%, rgba(250, 204, 21, 0.3) 100%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.h1 
              className="text-5xl md:text-6xl font-black text-black mb-4 tracking-tight"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.2 
              }}
            >
              BePro
            </motion.h1>
            
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-black mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {showReset ? 'Reset Password' : isSignIn ? 'Welcome Back' : 'Join BePro'}
            </motion.h2>
            
            <motion.p 
              className="text-black/70 text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {showReset
                ? 'We\'ll send you a reset link'
                : isSignIn
                ? 'Power your career with BePro'
                : 'Launching August 3, 2025'}
            </motion.p>
          </motion.div>

          {/* Form Container */}
          <motion.div
            variants={itemVariants}
            className="bg-black/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-black shadow-2xl relative overflow-hidden"
          >
            {/* Animated background pattern inside form */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600" />
              <motion.div
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255, 255, 255, 0.1) 10px,
                    rgba(255, 255, 255, 0.1) 11px
                  )`
                }}
                animate={{ x: [0, 20] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="relative z-10">
              {/* Back Button for Reset */}
              {showReset && (
                <motion.button
                  onClick={() => { 
                    setShowReset(false); 
                    setIsSignIn(true); 
                    setMessage(''); 
                    setMessageType('');
                    setResetEmail('');
                  }}
                  className="flex items-center text-yellow-400 hover:text-yellow-300 mb-6 transition-colors font-semibold"
                  whileHover={{ x: -5 }}
                >
                  <span className="mr-2 text-xl">←</span> Back
                </motion.button>
              )}

              {/* Form */}
              <AnimatePresence mode="wait">
                {showReset ? (
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-yellow-400 border-2 border-yellow-500 rounded-2xl px-6 py-4 text-black placeholder-black/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 font-medium"
                      />
                    </div>
                    <motion.button
                      onClick={handleResetPassword}
                      disabled={isSendingReset}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      {isSendingReset ? (
                        <div className="flex items-center justify-center">
                          <motion.div 
                            className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Sending...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form
                    key={isSignIn ? 'signin' : 'signup'}
                    initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isSignIn ? 20 : -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {!isSignIn && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="bg-yellow-400 border-2 border-yellow-500 rounded-2xl px-4 py-4 text-black placeholder-black/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="bg-yellow-400 border-2 border-yellow-500 rounded-2xl px-4 py-4 text-black placeholder-black/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 font-medium"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full bg-yellow-400 border-2 border-yellow-500 rounded-2xl px-6 py-4 text-black placeholder-black/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 font-medium"
                        />
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          required
                          className="w-full bg-yellow-400 border-2 border-yellow-500 rounded-2xl px-6 py-4 text-black focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 font-medium"
                        />
                      </motion.div>
                    )}

                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-yellow-400 border-2 border-yellow-500 rounded-2xl px-6 py-4 text-black placeholder-black/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 font-medium"
                    />

                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-yellow-400 border-2 border-yellow-500 rounded-2xl px-6 py-4 text-black placeholder-black/60 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 font-medium"
                    />

                    {isSignIn && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => { 
                            setShowReset(true); 
                            setMessage(''); 
                            setMessageType('') 
                          }}
                          className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition-colors underline decoration-2 underline-offset-2 cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <motion.div 
                            className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          {isSignIn ? 'Signing in...' : 'Creating account...'}
                        </div>
                      ) : (
                        isSignIn ? 'Sign In' : 'Create Account'
                      )}
                    </motion.button>

                    {/* Sign Up Link */}
                    {isSignIn && (
                      <motion.div 
                        className="text-center mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-yellow-400 text-sm font-medium">
                          Don't have an account?{' '}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignIn(false);
                            setMessage('');
                            setMessageType('');
                          }}
                          className="text-yellow-300 hover:text-yellow-200 text-sm font-bold underline decoration-2 underline-offset-2 transition-colors cursor-pointer"
                        >
                          Create Account
                        </button>
                      </motion.div>
                    )}

                    {/* Sign In Link */}
                    {!isSignIn && (
                      <motion.div 
                        className="text-center mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-yellow-400 text-sm font-medium">
                          Already have an account?{' '}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignIn(true);
                            setMessage('');
                            setMessageType('');
                          }}
                          className="text-yellow-300 hover:text-yellow-200 text-sm font-bold underline decoration-2 underline-offset-2 transition-colors"
                        >
                          Sign In
                        </button>
                      </motion.div>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Message */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`mt-6 p-4 rounded-2xl text-center font-semibold ${
                      messageType === 'error' 
                        ? 'bg-red-500 text-white' 
                        : messageType === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-400 text-black'
                    }`}
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            variants={itemVariants} 
            className="text-center mt-6 text-black/60 text-sm font-medium"
          >
            🔒 Secure authentication powered by Supabase
          </motion.div>
        </motion.div>
      </div>
      
      <Link
        href="/"
        className="fixed top-4 left-4 text-3xl font-bold text-black z-50"
      >
        BePro
      </Link>
    </div>
  )
}