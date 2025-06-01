'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase_client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [msg, setMsg] = useState('')
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

  if (loading) {
    return (
      <main className="bg-yellow-400 text-black font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-extrabold mb-4">BePro</div>
          <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-yellow-400 text-black font-sans">
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative">
        <div>
          {user ? (
            <div className="absolute top-6 right-6 flex gap-2">
              <p className="bg-black text-yellow-400 px-4 py-2 rounded font-semibold hover:bg-gray-900 transition-all">
                {msg}
              </p>
              <button
                className="bg-black text-yellow-400 px-4 py-2 rounded font-semibold hover:bg-gray-900 transition-all"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="absolute top-6 right-6 flex gap-2">
              <button
                className="bg-black text-yellow-400 px-4 py-2 rounded font-semibold hover:bg-gray-900 transition-all"
                onClick={() => router.push('/signin')}
              >
                Sign In
              </button>
              <button
                className="bg-black text-yellow-400 px-4 py-2 rounded font-semibold hover:bg-gray-900 transition-all"
                onClick={() => router.push('/signup')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Welcome to <span className="text-black">BePro!</span>
        </h1>
        <h2 className="text-xl md:text-2xl max-w-2xl mb-8">
          You're officially on the waitlist. Get ready to transform your career journey.
        </h2>

        <div className="bg-black text-yellow-400 px-8 py-4 rounded-lg mb-6">
          <p className="text-lg font-bold">Launch Date</p>
          <p className="text-3xl font-extrabold">August 1, 2025</p>
        </div>

        <p className="mt-6 text-black/80 text-lg">Learn smart. Build loud. Get hired.</p>
      </section>

      <section className="px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-10">What Happens Next?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl">📧</div>
            <p className="mt-4 font-semibold">Exclusive Updates</p>
            <p>Get the latest news, features, and early access invites straight to your inbox.</p>
          </div>
          <div>
            <div className="text-4xl">🚀</div>
            <p className="mt-4 font-semibold">Early Access</p>
            <p>Be among the first to experience BePro's AI-powered career tools.</p>
          </div>
          <div>
            <div className="text-4xl">🎁</div>
            <p className="mt-4 font-semibold">Founding Member Perks</p>
            <p>Special badges, bonus XP, and exclusive community access.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-yellow-300">
        <h2 className="text-3xl font-bold text-center mb-10">Your BePro Journey Starts Soon</h2>
        <div className="space-y-10 max-w-4xl mx-auto">
          <TimelineItem phase="Q2 2025 - Now" description="You're on the waitlist! We're building your personalized career OS." />
          <TimelineItem phase="Q3 2025 - Beta Launch" description="Early access to skill gap analysis, AI roadmaps, and project grading." />
          <TimelineItem phase="August 1, 2025 - Full Launch" description="Complete platform with XP system, community features, and job tracking." />
          <TimelineItem phase="Q4 2025 - Pro Features" description="Advanced mentorship, hackathon battles, and premium career tools." />
        </div>
      </section>

      <section className="px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-8">Join the Movement</h2>
        <p className="max-w-3xl mx-auto mb-10">Connect with fellow BePro members, share your progress, and level up together.</p>
        <div className="grid md:grid-cols-3 gap-8">
          <CommunityPanel title="Discord Community" desc="Chat with other waitlist members and get updates." />
          <CommunityPanel title="Progress Sharing" desc="Document your learning journey before launch." />
          <CommunityPanel title="Beta Testing" desc="Help shape BePro with your feedback." />
        </div>
      </section>

      <section className="bg-yellow-200 px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">From Our Alpha Testers</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <Testimonial name="Priya K." role="Frontend Dev" quote="The skill gap analysis showed me exactly what I was missing!" />
          <Testimonial name="Rahul S." role="UX Designer" quote="AI-generated learning path saved me months of research." />
          <Testimonial name="Ananya M." role="Data Analyst" quote="Finally, a career tool that actually gets it." />
        </div>
      </section>

      <section className="px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-10">Get Ready for Launch</h2>
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          <PrepTip icon="💼" title="Update Your Profile" desc="Start thinking about your current skills and career goals." />
          <PrepTip icon="🎯" title="Identify Target Roles" desc="Research job postings in your field to understand requirements." />
          <PrepTip icon="📚" title="Gather Your Work" desc="Collect projects, certificates, and achievements to showcase." />
        </div>
      </section>

      <section className="px-4 py-20 text-center bg-black text-yellow-400">
        <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
        <p className="mb-6">Join our community and get the latest updates.</p>
        <div className="flex gap-4 justify-center">
          <button className="bg-yellow-400 text-black px-6 py-3 font-bold rounded hover:bg-yellow-300">Join Discord</button>
          <button className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-6 py-3 font-bold rounded hover:bg-yellow-400 hover:text-black">Follow Updates</button>
        </div>
      </section>

      <footer className="bg-yellow-400 text-black px-4 py-10 grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-bold text-xl">BePro</h3>
          <p className="text-sm">Learn smart. Build loud. Get hired.</p>
        </div>
        <div>
          <h4 className="font-semibold">Quick Links</h4>
          <ul className="text-sm space-y-1">
            <li>Features</li>
            <li>About</li>
            <li>Blog</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Questions?</h4>
          <p className="text-sm mb-2">Need help or have feedback?</p>
          <button className="px-4 py-2 bg-black text-yellow-400 rounded text-sm">Contact Support</button>
        </div>
      </footer>
      <div className="text-center text-sm py-4">© 2025 BePro Inc. All rights reserved.</div>
    </main>
  )
}

function TimelineItem({ phase, description }) {
  return (
    <div className="bg-yellow-400 rounded-lg p-6 border border-black">
      <h3 className="font-bold text-xl mb-2">{phase}</h3>
      <p>{description}</p>
    </div>
  )
}

function CommunityPanel({ title, desc }) {
  return (
    <div className="bg-yellow-400 rounded-lg p-6 border border-black">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p>{desc}</p>
    </div>
  )
}

function Testimonial({ name, role, quote }) {
  return (
    <div className="bg-yellow-400 rounded-lg p-6 border border-black">
      <p className="italic mb-4">"{quote}"</p>
      <p className="font-semibold">{name}</p>
      <p className="text-sm">{role}</p>
    </div>
  )
}

function PrepTip({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  )
}
