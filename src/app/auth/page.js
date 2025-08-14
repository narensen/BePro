'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import useUserStore from '../store/useUserStore'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isSendingReset, setIsSendingReset] = useState(false)
  const router = useRouter()
  const setUserSession = useUserStore((state) => state.setUserSession)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')
    try {
      if (isSignIn) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setMessage(error.message)
          setMessageType('error')
        } else {
          const user = data.user
          setUserSession(user)
          const { data: profileData, error: profileError } = await supabase.from('profile').select('id').eq('email', email).single()
          if (profileError && profileError.code !== 'PGRST116') {
            setMessage('Error checking profile. Try again.')
            setMessageType('error')
          } else if (!profileData) {
            setMessage('Welcome. Please complete your profile.')
            setMessageType('info')
            setTimeout(() => router.push('/profile/build'), 1500)
          } else {
            setMessage('Welcome back.')
            setMessageType('success')
            setTimeout(() => router.push('/home'), 1500)
          }
        }
      } else {
        const { data: existingUser, error: checkError } = await supabase.from('profile').select('id').eq('email', email).maybeSingle()
        if (checkError) {
          setMessage('Server error. Please try again later.')
          setMessageType('error')
          setLoading(false)
          return
        }
        if (existingUser) {
          setMessage('This email is already registered. Please sign in instead.')
          setMessageType('error')
          setTimeout(() => setIsSignIn(true), 1500)
          setLoading(false)
          return
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              date_of_birth: dob ? dob.toISOString().split('T')[0] : null,
              full_name: `${firstName} ${lastName}`,
            },
          },
        })
        if (error) {
          setMessage(error.message)
          setMessageType('error')
        } else {
          if (data.user && !data.user.email_confirmed_at) {
            setMessage('Check your email for the confirmation link.')
            setMessageType('info')
          } else {
            setMessage('Account created successfully.')
            setMessageType('success')
          }
          setTimeout(() => router.push('/auth/confirm-email'), 1500)
        }
      }
    } catch {
      setMessage('An unexpected error occurred.')
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
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/update-password` })
      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        setMessage('Password reset link has been sent.')
        setMessageType('success')
        setShowReset(false)
        setResetEmail('')
      }
    } catch {
      setMessage('Failed to send reset email.')
      setMessageType('error')
    } finally {
      setIsSendingReset(false)
    }
  }

  const handleBackToHome = () => router.push('/')

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans flex items-center justify-center container-mobile mobile:px-3 px-4 relative overflow-hidden safe-top safe-bottom">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 mobile:w-16 w-16 sm:w-32 mobile:h-16 h-16 sm:h-32 bg-gray-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 mobile:w-24 w-24 sm:w-48 mobile:h-24 h-24 sm:h-48 bg-amber-600 rounded-full blur-3xl"></div>
      </div>
      <button 
        onClick={handleBackToHome} 
        className="touch-target absolute mobile:top-4 top-4 sm:top-6 mobile:left-3 left-4 sm:left-6 bg-gray-900 text-amber-300 mobile:px-3 px-3 sm:px-5 mobile:py-2 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer z-20 mobile:text-sm text-sm sm:text-base"
      >
        ← Back to Home
      </button>
      <div className="relative z-10 w-full mobile:max-w-full max-w-sm sm:max-w-md mobile-fade-in">
        <div className="text-center mobile:mb-6 mb-8">
          <h1 className="mobile:text-3xl text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">BePro</h1>
          <p className="text-gray-800 font-medium mobile:text-sm text-base sm:text-lg">Learn smart. Build loud. Get hired.</p>
        </div>
        <div className="bg-white/95 backdrop-blur-sm mobile:p-4 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200">
          <div className="text-center mobile:mb-4 mb-6">
            <h2 className="mobile:text-lg text-xl sm:text-2xl font-black text-gray-900 mb-2">
              {showReset ? 'Reset Password' : isSignIn ? 'Welcome Back' : 'Join the Waitlist'}
            </h2>
            <p className="mobile:text-sm text-sm sm:text-base text-gray-600">
              {showReset ? "We'll send you a reset link" : isSignIn ? 'Sign in to your BePro account' : 'Get early access to BePro and transform your career.'}
            </p>
          </div>
          {showReset && (
            <button 
              onClick={() => { setShowReset(false); setIsSignIn(true); setMessage(''); setMessageType(''); setResetEmail('') }} 
              className="touch-target flex items-center text-gray-600 hover:text-gray-800 mobile:mb-4 mb-6 transition-colors font-semibold"
            >
              <span className="mr-2 text-xl">←</span> Back
            </button>
          )}
          {message && (
            <div className={`mobile:mb-3 mb-4 mobile:p-3 p-3 rounded-xl text-center font-medium mobile:text-sm ${
              messageType === 'error' ? 'bg-red-100 text-red-800 border border-red-200' 
              : messageType === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
              {message}
            </div>
          )}
          {showReset ? (
            <div className="mobile:space-y-3 space-y-4">
              <div>
                <label className="block mobile:text-sm text-xs sm:text-sm font-bold text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  className="touch-target w-full mobile:px-4 px-3 sm:px-4 mobile:py-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium mobile:text-base text-sm sm:text-base"
                  autoComplete="email"
                />
              </div>
              <button 
                onClick={handleResetPassword} 
                disabled={isSendingReset} 
                className="touch-target w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 mobile:py-4 py-3 sm:py-4 rounded-xl font-black mobile:text-base text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 active:scale-95"
              >
                {isSendingReset ? <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-amber-300/20 border-t-amber-300 rounded-full animate-spin"></div>Sending...</div> : 'Send Reset Link'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mobile:space-y-3 space-y-4">
              {!isSignIn && (
                <div className="mobile:space-y-3 space-y-4">
                  <div className="mobile:grid-cols-1 grid grid-cols-2 mobile:gap-3 gap-4">
                    <div>
                      <label className="block mobile:text-sm text-xs sm:text-sm font-bold text-gray-700 mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="touch-target w-full mobile:px-4 px-3 sm:px-4 mobile:py-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium mobile:text-base text-sm sm:text-base" 
                        autoComplete="given-name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mobile:text-sm text-xs sm:text-sm font-bold text-gray-700 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="touch-target w-full mobile:px-4 px-3 sm:px-4 mobile:py-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium mobile:text-base text-sm sm:text-base" 
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mobile:text-sm text-xs sm:text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                    <DatePicker 
                      selected={dob} 
                      onChange={(date) => setDob(date)} 
                      dateFormat="dd/MM/yyyy" 
                      showMonthDropdown 
                      showYearDropdown 
                      dropdownMode="select" 
                      className="touch-target w-full mobile:px-4 px-3 sm:px-4 mobile:py-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium mobile:text-base text-sm sm:text-base" 
                      required
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block mobile:text-sm text-xs sm:text-sm font-bold text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="touch-target w-full mobile:px-4 px-3 sm:px-4 mobile:py-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium mobile:text-base text-sm sm:text-base" 
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="block mobile:text-sm text-xs sm:text-sm font-bold text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="touch-target w-full mobile:px-4 px-3 sm:px-4 mobile:py-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium mobile:text-base text-sm sm:text-base" 
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  required
                />
              </div>
              {isSignIn && (
                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => { setShowReset(true); setMessage(''); setMessageType('') }} 
                    className="touch-target text-gray-600 hover:text-gray-900 mobile:text-sm text-sm font-medium transition-colors underline decoration-2 underline-offset-2 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading} 
                className="touch-target w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 mobile:py-4 py-3 sm:py-4 rounded-xl font-black mobile:text-base text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 active:scale-95"
              >
                {loading ? <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-amber-300/20 border-t-amber-300 rounded-full animate-spin"></div>{isSignIn ? 'Signing in...' : 'Creating account...'}</div> : isSignIn ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}
          {!showReset && (
            <div className="mobile:mt-4 mt-6 text-center">
              <button 
                onClick={() => { setIsSignIn(!isSignIn); setMessage(''); setMessageType('') }} 
                className="touch-target text-gray-600 hover:text-gray-900 font-medium transition-colors mobile:text-sm text-sm sm:text-base cursor-pointer"
              >
                {isSignIn ? "Don't have an account? Create Account" : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
