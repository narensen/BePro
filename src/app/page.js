'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase_client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useUserStore from './store/useUserStore'
import { CommunityPanel, FeatureCard, GetStartedButton, StayConnected } from './components'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [mail, setMail] = useState('')
  const [msg, setMsg] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const router = useRouter()

  const {
    setUserSession,
    setUsername,
    clearUserSession
  } = useUserStore()

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error fetching session:', error)
        setUser(null)
        setMsg('')
        setLoading(false)
        return
      }

      const session = data?.session

      if (!session) {
        setUser(null)
        setMsg('')
        clearUserSession()
      } else {
        const userObj = session.user

        setUser(userObj)
        setMail(userObj.email)

        // Fetch username from profile table
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profile')
            .select('username')
            .eq('email', userObj.email)
            .single()

          const displayUsername = profileData?.username || userObj.user_metadata?.username || 'User'
          
          setMsg(displayUsername)
          
          // ✅ Save to Zustand
          setUserSession(userObj)
          setUsername(displayUsername)
        } catch (error) {
          console.error('Error fetching profile username:', error)
          // Fallback to user metadata or default
          const fallbackUsername = userObj.user_metadata?.username || 'User'
          setMsg(fallbackUsername)
          setUserSession(userObj)
          setUsername(fallbackUsername)
        }
      }

      setLoading(false)
    }

    checkUser()
  }, [setUserSession, setUsername, clearUserSession])

  const handleClick = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 6000)
  }

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error)
    setUser(null)
    setMsg('')
    clearUserSession()
    setLoading(false)
  }

  const handleSignUp = () => {
    setTransitioning(true)
    setTimeout(() => {
      router.push('/auth')
      console.log('Navigate to /auth')
    }, 300)
  }

  if (loading || transitioning) {
    return (
      <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-mono min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse">
            BePro
          </div>
          <div className="w-10 h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          {transitioning && (
            <p className="mt-4 text-gray-800 font-medium animate-fadeIn">
              Taking you there...
            </p>
          )}
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </main>
    )
  }

  return (
    <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans">
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-900 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-amber-600 rounded-full blur-3xl"></div>
        </div>

        {user ? (
          <div className="absolute top-6 right-6 flex gap-3 z-20">
            <button className="bg-gray-900 text-amber-300 px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300">
              <Link href="/home">Home</Link>
            </button>
            <button
              className="bg-gray-900 text-amber-300 px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="absolute top-6 right-6 flex gap-3 z-20">
            <GetStartedButton onClick={handleSignUp} />
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/BP.png" 
              alt="BePro Logo" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-2xl border-4 border-white/20"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">BePro!</span>
          </h1>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30">
            <h2 className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-800 font-medium leading-relaxed">
              {user
                ? "You're officially on the waitlist. Transform your career journey with AI-powered precision."
                : "Join the waitlist. Transform your career journey with AI-powered precision."}
            </h2>
          </div>

          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 px-10 py-6 rounded-2xl mb-8 shadow-2xl border border-gray-700">
            {user ? (
              <h1 className="uppercase text-3xl font-semibold mb-2">{msg}</h1>
            ) : (
              <>
                <p className="text-lg font-bold mb-2">Launch Date</p>
                <p className="text-4xl font-black">August 3, 2025</p>
              </>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/50">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Learn smart. Build loud. Get hired.</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">🧠</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">AI-Powered Learning</h4>
                <p className="text-gray-600 text-sm">Personalized career guidance</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">🏗️</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Build Your Portfolio</h4>
                <p className="text-gray-600 text-sm">Showcase your skills</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">💼</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Land Your Dream Job</h4>
                <p className="text-gray-600 text-sm">Connect with opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 text-center bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-400">
        <h2 className="text-4xl font-black mb-12 text-gray-900">What Happens Next?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon="📧"
            title="Exclusive Updates"
            desc="Get the latest news, features, and early access invites straight to your inbox."
            gradient="from-blue-500 to-blue-600"
          />
          <FeatureCard
            icon="🚀"
            title="Early Access"
            desc="Be among the first to experience BePro's AI-powered career tools."
            gradient="from-purple-500 to-purple-600"
          />
          <FeatureCard
            icon="🎁"
            title="Founding Member Perks"
            desc="Special badges, bonus XP, and exclusive community access."
            gradient="from-emerald-500 to-emerald-600"
          />
        </div>
      </section>

      <section className="px-4 py-24 text-center bg-gradient-to-b from-yellow-400 via-amber-400 to-yellow-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-3xl">🌟</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">Join the Movement</h2>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto mb-12 border border-white/30">
            <p className="text-xl text-gray-800 leading-relaxed font-medium">
              Connect with fellow BePro members, share your progress, and level up together in our thriving community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <CommunityPanel title="Discord Community" desc="Chat with other waitlist members and get updates." icon="💬" />
            <CommunityPanel title="Progress Sharing" desc="Document your learning journey before launch." icon="📈" />
            <CommunityPanel title="Beta Testing" desc="Help shape BePro with your feedback." icon="🧪" />
          </div>
        </div>
      </section>

      {user ? (
        <section className="px-4 py-24 text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300">
          <h2 className="text-4xl font-black mb-6">Stay Connected</h2>
          <p className="mb-10 text-xl text-amber-200">Join our community and get the latest updates.</p>
          <div className="flex gap-6 justify-center flex-wrap">
            <StayConnected user_email={mail} supabase={supabase} />
          </div>
        </section>
      ) : (
        <section className="px-4 py-24 text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300">
          <h2 className="text-4xl font-black mb-6">Stay Connected</h2>
          <p className="mb-10 text-xl text-amber-200">Join our community and get the latest updates.</p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/auth">
              <button
                className="bg-transparent border-2 border-amber-400 text-amber-400 px-8 py-4 font-black rounded-xl hover:bg-amber-400 hover:text-gray-900 hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={handleClick}
              >
                Login to Subscribe
              </button>
            </Link>
          </div>
        </section>
      )}

      <footer className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 text-gray-900 px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div>
            <h3 className="font-black text-2xl mb-4">BePro</h3>
            <p className="text-gray-800 font-medium">Learn smart. Build loud. Get hired.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-800">
              <li className="hover:text-gray-900 cursor-pointer transition-colors">
                <Link href="faq/about">About</Link>
              </li>
              <li className="hover:text-gray-900 cursor-pointer transition-colors">
                <Link href="faq/privacy-policy">Privacy Policy</Link>
              </li>
              <li className="hover:text-gray-900 cursor-pointer transition-colors">
                <Link href="faq/tos">Terms of Service</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Questions?</h4>
            <button className="px-6 py-3 bg-gray-900 text-amber-300 rounded-xl font-bold hover:bg-gray-800 hover:scale-105 transition-all duration-300 cursor-pointer">
              Contact Support
            </button>
          </div>
        </div>
      </footer>

      <div className="text-center py-6 bg-gray-900 text-amber-300 font-medium">
        © 2025 BePro Inc. All rights reserved.
      </div>
    </main>
  )
}
