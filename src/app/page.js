'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase_client' // ASSUMPTION: Supabase client is configured here
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// --- Enhanced SVG Icons ---
const CodexIcon = ({ className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-xl"></div>
    <svg xmlns="http://www.w3.org/2000/svg" className="relative h-12 w-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18M5.468 18.37A8.962 8.962 0 0112 3c1.933 0 3.741.61 5.232 1.628a8.962 8.962 0 01-1.232 12.118A8.962 8.962 0 015.468 18.37z" />
    </svg>
  </div>
);

const FortressIcon = ({ className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full blur-xl"></div>
    <svg xmlns="http://www.w3.org/2000/svg" className="relative h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  </div>
);

const SparkleIcon = ({ className = "" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
);

// --- Advanced Hooks ---
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
};

const useOnScreen = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1, ...options });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return [ref, isVisible];
};


// --- Interactive Card Component ---
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const [ref, isVisible] = useOnScreen();

  return (
    <div
      ref={ref}
      className={`relative p-8 rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 transition-all duration-700 hover:scale-105 hover:border-amber-400/50 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
      
      <div className="relative z-10">
        <div className="mb-6 flex justify-center">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 text-center">{title}</h3>
        <p className="text-gray-300 text-center leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// --- Animated Section Component ---
const AnimatedSection = ({ children, className = "", background = "", id = "" }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  
  return (
    <section
      id={id}
      ref={ref}
      className={`relative ${className} ${background} transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </section>
  );
};

// --- Main App Component ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const mousePosition = useMousePosition();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleAuthRedirect = () => {
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparkleIcon className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative bg-gray-900 text-white overflow-x-hidden">
      {/* Dynamic background with mouse interaction */}
      <div 
        className="fixed inset-0 opacity-50 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(251, 191, 36, 0.1), transparent 40%)`,
        }}
      />
      
      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl px-8 py-4 mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              BePro
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#codex" className="text-gray-300 hover:text-white transition-colors">The Codex</Link>
              <Link href="#fortress" className="text-gray-300 hover:text-white transition-colors">The Fortress</Link>
              <Link href="#philosophy" className="text-gray-300 hover:text-white transition-colors">The Philosophy</Link>
            </nav>
            <div>
              {user ? (
                <Link href="/home" className="px-6 py-3 font-semibold bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/25">
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleAuthRedirect}
                  className="px-6 py-3 font-semibold bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/25"
                >
                  Enter The Forge
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-amber-900/10 to-orange-900/10" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent animate-fade-in-down">
              Stop Learning.
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-fade-in-up">
              Start Commanding.
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            The world is drowning in courses and cringe-worthy networks. The top 1% are being forged elsewhere. 
            <span className="text-amber-400 font-semibold"> Welcome to the forge.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <button
              onClick={handleAuthRedirect}
              className="group relative px-10 py-4 font-bold bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl text-xl shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Begin Your Ascent</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* --- Problem Section --- */}
      <AnimatedSection className="py-32 px-4" background="bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            The Illusion of Progress
          </h2>
          <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed">
            You've done everything they told you to. You've taken the courses. You've collected the certificates. 
            And yet, you are still at the bottom of the mountain. The tools you have been given are designed to make you 
            <span className="text-red-400 font-semibold"> a better soldier</span>, not 
            <span className="text-orange-400 font-semibold"> the emperor</span>.
          </p>
        </div>
      </AnimatedSection>

      {/* --- Solution Section (The Codex) --- */}
      <AnimatedSection id="codex" className="py-32 px-4" background="bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              The <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Codex</span>: Your AI Mentor
            </h2>
            <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed">
              BePro is not a tutor that gives you the answers. It is an AI Mentor that asks the hard questions. 
              The Codex deconstructs the path to any elite tech role and creates a personalized, step-by-step roadmap for your conquest.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CodexIcon />}
              title="Deconstruction"
              description="The Codex analyzes thousands of data points to generate a master blueprint of the exact skills and projects required for your target role."
              delay={0}
            />
            <FeatureCard
              icon={<CodexIcon />}
              title="Prescription"
              description="You receive a single, focused mission each week. The Codex provides the curated resources you need to win. Your only job is to execute."
              delay={200}
            />
            <FeatureCard
              icon={<CodexIcon />}
              title="Validation"
              description="As you complete missions, your AI Mentor evaluates your work, pushing you to improve. Your BePro profile becomes a living, validated record of your mastery."
              delay={400}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* --- Community Section --- */}
      <AnimatedSection id="fortress" className="py-32 px-4" background="bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              The <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Community Fortress</span>
            </h2>
            <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed">
              An emperor does not fight alone. BePro forges elite, high-trust communities within each university. 
              Compete, collaborate, and conquer alongside the best commanders from your own college.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FortressIcon />}
              title="College-Specific"
              description="Join a private fortress accessible only to students from your university, verified by your college email."
              delay={0}
            />
            <FeatureCard
              icon={<FortressIcon />}
              title="Inter-Community Raids"
              description="Participate in challenges and collaborative roadmaps against other universities to prove who forges the best commanders."
              delay={200}
            />
            <FeatureCard
              icon={<FortressIcon />}
              title="Recruit Your Allies"
              description="Find your future co-founders and collaborators within a high-trust network of the most ambitious builders on your campus."
              delay={400}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* --- Philosophy Section --- */}
      <AnimatedSection id="philosophy" className="py-32 px-4" background="bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-12 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            This Is Not For Everyone.
          </h2>
          <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed">
            BePro is not a public park. It is a fortress where warriors are forged. We are not for the casual learner; 
            we are for the <span className="text-orange-400 font-semibold">obsessed builder</span>. We are not for the 95% who seek comfort; 
            we are for the <span className="text-red-400 font-semibold">5% who seek the throne</span>.
          </p>
        </div>
      </AnimatedSection>

      {/* --- Final CTA --- */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-amber-900/10 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(251,191,36,0.2),rgba(0,0,0,0))]" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h2 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent">
            The Throne is Empty.
          </h2>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Stop preparing. Start conquering.
          </p>
          <button
            onClick={handleAuthRedirect}
            className="group relative px-12 py-5 font-bold bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl text-2xl shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Enter The Forge</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-black border-t border-white/10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h3 className="font-black text-4xl mb-6 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">BePro</h3>
              <p className="text-xl text-gray-300 mb-6 max-w-md">Learn smart. Build loud. Get hired.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-6 text-white">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Roadmap', 'API'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Contact', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} BePro Inc. The Forge is Open.</p>
          </div>
        </div>
      </footer>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { 
          animation: fade-in-down 1s ease-out forwards; 
        }
        .animate-fade-in-up { 
          animation: fade-in-up 1s ease-out forwards; 
          opacity: 0;
        }
      `}</style>
    </main>
  );
}
