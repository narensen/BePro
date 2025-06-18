'use client'

import { useState } from 'react'
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

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    setMessageType('')

    // Simulate API call
    setTimeout(() => {
      if (isSignIn) {
        setMessage('Welcome back! 🎉')
        setMessageType('success')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setMessage('Check your email to confirm your account! 📧')
        setMessageType('info')
        setTimeout(() => {
          // router.push('/auth/confirm-email')
        }, 1500)
      }
      setLoading(false)
    }, 2000)
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setMessage('Please enter your email.')
      setMessageType('error')
      return
    }

    setIsSendingReset(true)
    setMessage('')
    
    // Simulate reset password
    setTimeout(() => {
      setMessage('Password reset email sent! Check your inbox 📧')
      setMessageType('success')
      setShowReset(false)
      setResetEmail('')
      setIsSendingReset(false)
    }, 2000)
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration - same as landing page */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-amber-600 rounded-full blur-3xl"></div>
      </div>

      {/* Back button - same styling as landing page */}
      <button
        onClick={handleBackToHome}
        className="absolute top-6 left-6 bg-gray-900 text-amber-300 px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300 cursor-pointer z-20"
      >
        ← Back to Home
      </button>

      <div className="relative z-10 w-full max-w-md">
        {/* BePro Logo - same styling as landing page */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            BePro
          </h1>
          <p className="text-gray-800 font-medium text-lg">Learn smart. Build loud. Get hired.</p>
        </div>

        {/* Auth Card - using white background like the original design */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {showReset ? 'Reset Password' : isSignIn ? 'Welcome Back' : 'Join the Waitlist'}
            </h2>
            <p className="text-gray-600">
              {showReset
                ? "We'll send you a reset link"
                : isSignIn
                ? 'Sign in to your BePro account'
                : 'Get early access to BePro and transform your career!'
              }
            </p>
          </div>

          {/* Back Button for Reset */}
          {showReset && (
            <button
              onClick={() => { 
                setShowReset(false); 
                setIsSignIn(true); 
                setMessage(''); 
                setMessageType('');
                setResetEmail('');
              }}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors font-semibold"
            >
              <span className="mr-2 text-xl">←</span> Back
            </button>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-center font-medium ${
              messageType === 'error' 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : messageType === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {message}
            </div>
          )}

          {/* Form */}
          {showReset ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium"
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={isSendingReset}
                className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSendingReset ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-amber-300/20 border-t-amber-300 rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!isSignIn && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium"
                  required
                />
              </div>

              {isSignIn && (
                <div className="text-right">
                  <button
                    onClick={() => { 
                      setShowReset(true); 
                      setMessage(''); 
                      setMessageType('') 
                    }}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors underline decoration-2 underline-offset-2 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-amber-300/20 border-t-amber-300 rounded-full animate-spin"></div>
                    {isSignIn ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isSignIn ? '✨ Sign In' : '🚀 Join Waitlist'
                )}
              </button>
            </div>
          )}

          {/* Toggle between Sign In and Sign Up */}
          {!showReset && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setMessage('');
                  setMessageType('');
                }}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                {isSignIn 
                  ? "Don't have an account? Join the waitlist" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          )}

          {/* Waitlist Perks for Sign Up */}
          {!isSignIn && !showReset && (
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <h3 className="font-bold text-gray-900 mb-2">🎁 Waitlist Perks:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Early access to BePro platform</li>
                <li>• Exclusive founding member badge</li>
                <li>• Priority support and feedback</li>
                <li>• Bonus XP when you join</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}