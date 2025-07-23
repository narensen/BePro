'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase_client' // ASSUMPTION: Supabase client is configured here
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// --- SVG Icons for a Professional Look ---
const CodexIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-300 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18M5.468 18.37A8.962 8.962 0 0112 3c1.933 0 3.741.61 5.232 1.628a8.962 8.962 0 01-1.232 12.118A8.962 8.962 0 015.468 18.37z" />
  </svg>
);
const FortressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-300 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// --- Custom Hook for Scroll Animations ---
const useOnScreen = (options) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return [ref, isVisible];
};

// --- Animated Section Component ---
const AnimatedSection = ({ children, className }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {children}
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // On component mount, check for a user session
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      setLoading(false);
    };
    checkUser();
  }, []);

  // Handler for signing up/logging in
  const handleAuthRedirect = () => {
    router.push('/auth'); // Using Next.js router
  };
  
  // Handler for signing out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <main className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="bg-gray-900 text-gray-100 font-sans antialiased">
      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 bg-gray-900/50 backdrop-blur-md border-b border-gray-700/50">
        <div className="text-2xl font-black text-amber-400">BePro</div>
        <div>
          {user ? (
             <Link href="/home" className="px-6 py-2 font-bold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors mr-4">
              Dashboard
            </Link>
          ) : (
            <button
              onClick={handleAuthRedirect}
              className="px-6 py-2 font-bold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors"
            >
              Enter The Forge
            </button>
          )}
        </div>
      </header>

      {/* --- Section 1: The Hook --- */}
      <section className="min-h-screen flex items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,191,36,0.3),rgba(255,255,255,0))]"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight text-white animate-fade-in-down">
            Stop Learning.
            <br />
            <span className="text-amber-400">Start Commanding.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 mb-10 animate-fade-in-up">
            The world is drowning in courses and cringe-worthy networks. The top 1% are being forged elsewhere. Welcome to the forge.
          </p>
          <button
            onClick={handleAuthRedirect}
            className="px-10 py-4 font-bold text-gray-900 bg-amber-400 rounded-lg text-xl shadow-lg shadow-amber-500/20 hover:bg-amber-300 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
          >
            Begin Your Ascent
          </button>
        </div>
      </section>

      {/* --- Section 2: The Problem --- */}
      <AnimatedSection className="py-24 px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">The Illusion of Progress</h2>
        <p className="max-w-3xl mx-auto text-xl text-gray-400 leading-relaxed">
          You&apos;ve done everything they told you to. You&apos;ve taken the courses. You&apos;ve collected the certificates. And yet, you are still at the bottom of the mountain. The tools you have been given are designed to make you a better soldier, not the emperor.
        </p>
      </AnimatedSection>

      {/* --- Section 3: The Solution (The Codex) --- */}
      <AnimatedSection className="py-24 px-4 text-center bg-black">
        <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">
          The <span className="text-amber-400">Codex</span>: Your AI Mentor
        </h2>
        <p className="max-w-3xl mx-auto text-xl text-gray-400 leading-relaxed mb-12">
          BePro is not a tutor that gives you the answers. It is an AI Mentor that asks the hard questions. The Codex deconstructs the path to any elite tech role and creates a personalized, step-by-step roadmap for your conquest.
        </p>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <CodexIcon />
                <h3 className="text-2xl font-bold text-white mb-2">Deconstruction</h3>
                <p className="text-gray-400">The Codex analyzes thousands of data points to generate a master blueprint of the exact skills and projects required for your target role.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <CodexIcon />
                <h3 className="text-2xl font-bold text-white mb-2">Prescription</h3>
                <p className="text-gray-400">You receive a single, focused mission each week. The Codex provides the curated resources you need to win. Your only job is to execute.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <CodexIcon />
                <h3 className="text-2xl font-bold text-white mb-2">Validation</h3>
                <p className="text-gray-400">As you complete missions, your AI Mentor evaluates your work, pushing you to improve. Your BePro profile becomes a living, validated record of your mastery.</p>
            </div>
        </div>
      </AnimatedSection>

      {/* --- Section 4: The Community Fortress --- */}
      <AnimatedSection className="py-24 px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">
          The <span className="text-amber-400">Community Fortress</span>
        </h2>
        <p className="max-w-3xl mx-auto text-xl text-gray-400 leading-relaxed mb-12">
          An emperor does not fight alone. BePro forges elite, high-trust communities within each university. Compete, collaborate, and conquer alongside the best commanders from your own college.
        </p>
         <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <FortressIcon />
                <h3 className="text-2xl font-bold text-white mb-2">College-Specific</h3>
                <p className="text-gray-400">Join a private fortress accessible only to students from your university, verified by your college email.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <FortressIcon />
                <h3 className="text-2xl font-bold text-white mb-2">Inter-Community Raids</h3>
                <p className="text-gray-400">Participate in challenges and collaborative roadmaps against other universities to prove who forges the best commanders.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <FortressIcon />
                <h3 className="text-2xl font-bold text-white mb-2">Recruit Your Allies</h3>
                <p className="text-gray-400">Find your future co-founders and collaborators within a high-trust network of the most ambitious builders on your campus.</p>
            </div>
        </div>
      </AnimatedSection>
      
      {/* --- Section 5: The Philosophy --- */}
      <AnimatedSection className="py-24 px-4 text-center bg-black">
        <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">This Is Not For Everyone.</h2>
        <p className="max-w-3xl mx-auto text-xl text-gray-400 leading-relaxed">
          BePro is not a public park. It is a fortress where warriors are forged. We are not for the casual learner; we are for the obsessed builder. We are not for the 95% who seek comfort; we are for the 5% who seek the throne.
        </p>
      </AnimatedSection>

      {/* --- Section 6: Final CTA --- */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900 to-black opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(251,191,36,0.3),rgba(255,255,255,0))]"></div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-8xl font-black mb-6 text-white">The Throne is Empty.</h2>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 mb-10">
            Stop preparing. Start conquering.
          </p>
          <button
            onClick={handleAuthRedirect}
            className="px-10 py-4 font-bold text-gray-900 bg-amber-400 rounded-lg text-xl shadow-lg shadow-amber-500/20 hover:bg-amber-300 transform hover:scale-105 transition-all duration-300"
          >
            Enter The Forge
          </button>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-black text-gray-400 px-6 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-black text-2xl mb-4 text-amber-400">BePro</h3>
            <p className="text-gray-500">Learn smart. Build loud. Get hired.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/tos" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Questions?</h4>
            <button className="px-6 py-3 bg-gray-800 text-amber-400 rounded-lg font-bold hover:bg-gray-700 hover:scale-105 transition-all duration-300">
              Contact Support
            </button>
          </div>
        </div>
        <div className="text-center pt-12 mt-12 border-t border-gray-800">
          <p>© {new Date().getFullYear()} BePro Inc. The Forge is Open.</p>
        </div>
      </footer>

      {/* Simple CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out 0.5s forwards; animation-fill-mode: backwards; }
      `}</style>
    </main>
  );
}
