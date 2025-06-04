'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase_client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {CommunityPanel, FeatureCard, CreativeAuthButton, PrepTip, SideNavbar, Testimonial, TimelineItem} from './components'


export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [msg, setMsg] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const router = useRouter()

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
      } else {
        setUser(session.user)
        setMsg(session.user.user_metadata?.username || 'User')
      }
      setLoading(false)
    }

    checkUser()
  }, [])

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error)
    setUser(null)
    setMsg('')
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
      <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans min-h-screen flex items-center justify-center">
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
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-900 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-amber-600 rounded-full blur-3xl"></div>
        </div>
        
        {/* Auth buttons - positioned absolutely at top right */}
        {user ? (
          <div className="absolute top-6 right-6 flex gap-3 z-20">
            <p className="bg-gray-900 text-amber-300 px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all duration-300">
              {msg}
            </p>
            <button
              className="bg-gray-900 text-amber-300 px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="absolute top-6 right-6 flex gap-3 z-20">
              <CreativeAuthButton onClick={handleSignUp}></CreativeAuthButton>              
              </div>
        )}
        
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">BePro!</span>
          </h1>
          <h2 className="text-xl md:text-2xl max-w-3xl mb-10 text-gray-800 font-medium leading-relaxed">
            {user ? ("You're officially on the waitlist. Get ready to transform your career journey with\nAI-powered precision.") : ("Join the waitlist. Get ready to transform your career journey with\nAI-powered precision")}
          </h2>

          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 px-10 py-6 rounded-2xl mb-8 shadow-2xl border border-gray-700">
            <p className="text-lg font-bold mb-2">🚀 Launch Date</p>
            <p className="text-4xl font-black">August 3, 2025</p>
          </div>

          <p className="mt-8 text-gray-800 text-xl font-semibold">Learn smart. Build loud. Get hired.</p>
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

      <section className="px-4 py-24 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300">
        <h2 className="text-4xl font-black text-center mb-12 text-gray-900">Your BePro Journey Starts Soon</h2>
        <div className="space-y-8 max-w-5xl mx-auto">
          <TimelineItem
            phase="Q2 2025 - Now"
            description="You're on the waitlist! We're building your personalized career OS."
            status="active"
          />
          <TimelineItem
            phase="Q3 2025 - Beta Launch"
            description="Early access to skill gap analysis, AI roadmaps, and project grading."
            status="upcoming"
          />
          <TimelineItem
            phase="August 1, 2025 - Full Launch"
            description="Complete platform with XP system, community features, and job tracking."
            status="upcoming"
          />
          <TimelineItem
            phase="Q4 2025 - Pro Features"
            description="Advanced mentorship, hackathon battles, and premium career tools."
            status="future"
          />
        </div>
      </section>

      <section className="px-4 py-24 text-center bg-gradient-to-b from-yellow-400 via-amber-400 to-yellow-400">
        <h2 className="text-4xl font-black mb-10 text-gray-900">Join the Movement</h2>
        <p className="max-w-4xl mx-auto mb-12 text-xl text-gray-800 leading-relaxed">
          Connect with fellow BePro members, share your progress, and level up together in our thriving community.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <CommunityPanel title="Discord Community" desc="Chat with other waitlist members and get updates." icon="💬" />
          <CommunityPanel title="Progress Sharing" desc="Document your learning journey before launch." icon="📈" />
          <CommunityPanel title="Beta Testing" desc="Help shape BePro with your feedback." icon="🧪" />
        </div>
      </section>

      <section className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 px-4 py-24">
        <h2 className="text-4xl font-black text-center mb-16 text-gray-900">From Our Alpha Testers</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto">
          <Testimonial name="Priya K." role="Frontend Dev" quote="The skill gap analysis showed me exactly what I was missing!" />
          <Testimonial name="Rahul S." role="UX Designer" quote="AI-generated learning path saved me months of research." />
          <Testimonial name="Ananya M." role="Data Analyst" quote="Finally, a career tool that actually gets it." />
        </div>
      </section>

      <section className="px-4 py-24 text-center bg-gradient-to-b from-yellow-400 via-amber-400 to-yellow-400">
        <h2 className="text-4xl font-black mb-12 text-gray-900">Get Ready for Launch</h2>
        <div className="max-w-3xl mx-auto space-y-8 text-left">
          <PrepTip icon="💼" title="Update Your Profile" desc="Start thinking about your current skills and career goals." />
          <PrepTip icon="🎯" title="Identify Target Roles" desc="Research job postings in your field to understand requirements." />
          <PrepTip icon="📚" title="Gather Your Work" desc="Collect projects, certificates, and achievements to showcase." />
        </div>
      </section>

      <section className="px-4 py-24 text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300">
        <h2 className="text-4xl font-black mb-6">Stay Connected</h2>
        <p className="mb-10 text-xl text-amber-200">Join our community and get the latest updates.</p>
        <div className="flex gap-6 justify-center flex-wrap">
          <button className="bg-transparent border-2 border-amber-400 text-amber-400 px-8 py-4 font-black rounded-xl hover:bg-amber-400 hover:text-gray-900 hover:scale-105 transition-all duration-300 cursor-pointer">
            Follow Updates
          </button>
        </div>
      </section>

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
                <Link href="/about">About</Link></li>
                <li className="hover:text-gray-900 cursor-pointer transition-colors">
                  <Link href="/privacypolicy">Privacy Policy</Link>
                </li>
                <li className="hover:text-gray-900 cursor-pointer transition-colors">
                  <Link href="/termsofservice">Terms of Service</Link>
                </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Questions?</h4>
            <p className="text-gray-800 mb-6">Need help or have feedback?</p>
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