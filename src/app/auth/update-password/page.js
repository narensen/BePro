'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase_client'


export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse">
            BePro
          </div>
          <div className="w-10 h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-800 font-medium">
            Updating your password...
          </p>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans min-h-screen relative overflow-hidden">
        {}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-900 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-amber-600 rounded-full blur-3xl"></div>
        </div>

        <div className="flex items-center justify-center min-h-screen px-4 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 max-w-md w-full text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Password Updated!
            </h1>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <button
              onClick={() => window.location.href = '/signin'}
              className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Continue to Sign In
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans min-h-screen relative overflow-hidden">
      {}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-amber-600 rounded-full blur-3xl"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 max-w-md w-full">
          {}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
              BePro
            </h1>
            <p className="text-gray-600 font-medium">Update Your Password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {}
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {}
            <div className="text-sm text-gray-600 bg-amber-50 p-3 rounded-xl">
              Password must be at least 6 characters long
            </div>

            {}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}