'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// --- Enhanced SVG Icons ---
const CodexIcon = ({ className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
    <svg xmlns="http://www.w3.org/2000/svg" className="relative h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  </div>
);

const FortressIcon = ({ className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
    <svg xmlns="http://www.w3.org/2000/svg" className="relative h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  </div>
);

const SparkleIcon = ({ className = "" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
);

// --- Advanced Animations Hook ---
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

// --- Floating Particles Component ---
const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    speed: Math.random() * 2 + 1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.id * 0.1}s`,
            animation: `float ${particle.speed * 3}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
};

// --- Interactive Card Component ---
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const [ref, isVisible] = useOnScreen();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={`relative p-8 rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 transition-all duration-700 hover:scale-105 hover:border-blue-400/50 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
      
      <div className="relative z-10">
        <div className="mb-6 flex justify-center">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 text-center">{title}</h3>
        <p className="text-gray-300 text-center leading-relaxed">{description}</p>
      </div>

      {/* Animated corner accents */}
      <div className={`absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full transition-all duration-300 ${isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`} />
      <div className={`absolute bottom-2 left-2 w-2 h-2 bg-purple-400 rounded-full transition-all duration-300 ${isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`} />
    </div>
  );
};

// --- Animated Section Component ---
const AnimatedSection = ({ children, className = "", background = "" }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  
  return (
    <section
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
  const [scrollY, setScrollY] = useState(0);
  const mousePosition = useMousePosition();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthRedirect = () => {
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400/20 border-b-purple-400 rounded-full animate-spin animate-reverse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparkleIcon className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative bg-slate-900 text-white overflow-x-hidden">
      {/* Dynamic background with mouse interaction */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
        }}
      />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.1}px)`,
        }} />
      </div>

      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl px-8 py-4 mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BePro
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link href="#community" className="text-gray-300 hover:text-white transition-colors">Community</Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            </nav>
            <div>
              {user ? (
                <Link href="/home" className="px-6 py-3 font-semibold bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25">
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleAuthRedirect}
                  className="px-6 py-3 font-semibold bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
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
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20" />
        
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full border border-blue-400/30 bg-blue-400/10 backdrop-blur-sm">
            <SparkleIcon className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-400">Revolutionary AI-Powered Learning</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent animate-fade-in-down">
              Stop Learning.
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-fade-in-up">
              Start Commanding.
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            The world is drowning in courses and cringe-worthy networks. The top 1% are being forged elsewhere. 
            <span className="text-blue-400 font-semibold"> Welcome to the forge.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <button
              onClick={handleAuthRedirect}
              className="group relative px-10 py-4 font-bold bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Begin Your Ascent</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <button className="flex items-center px-6 py-4 text-gray-300 hover:text-white transition-colors group">
              <div className="w-12 h-12 rounded-full border-2 border-gray-400 group-hover:border-white flex items-center justify-center mr-3 transition-colors">
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <span className="font-medium">Watch Demo</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-400 mb-2">10k+</div>
              <div className="text-sm text-gray-400">Elite Builders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-purple-400 mb-2">95%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-cyan-400 mb-2">500+</div>
              <div className="text-sm text-gray-400">Universities</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Problem Section --- */}
      <AnimatedSection className="py-32 px-4" background="bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              The Illusion of Progress
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-orange-400 mx-auto rounded-full mb-8" />
          </div>
          
          <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed mb-16">
            You've done everything they told you to. You've taken the courses. You've collected the certificates. 
            And yet, you are still at the bottom of the mountain. The tools you have been given are designed to make you 
            <span className="text-red-400 font-semibold"> a better soldier</span>, not 
            <span className="text-orange-400 font-semibold"> the emperor</span>.
          </p>

          {/* Problem visualization */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: "Endless Courses", desc: "Always learning, never building", color: "red" },
              { title: "Generic Paths", desc: "One-size-fits-all mediocrity", color: "orange" },
              { title: "No Real Validation", desc: "Certificates without competence", color: "yellow" }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 group hover:scale-105 transition-all duration-500">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-${item.color}-500/10 to-${item.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <h3 className={`text-2xl font-bold text-${item.color}-400 mb-4`}>{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* --- Solution Section (The Codex) --- */}
      <AnimatedSection id="features" className="py-32 px-4" background="bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              The <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Codex</span>: Your AI Mentor
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full mb-8" />
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
      <AnimatedSection id="community" className="py-32 px-4" background="bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              The <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Community Fortress</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto rounded-full mb-8" />
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
      <AnimatedSection className="py-32 px-4" background="bg-slate-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            This Is Not For Everyone.
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full mb-12" />
          <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed">
            BePro is not a public park. It is a fortress where warriors are forged. We are not for the casual learner; 
            we are for the <span className="text-purple-400 font-semibold">obsessed builder</span>. We are not for the 95% who seek comfort; 
            we are for the <span className="text-pink-400 font-semibold">5% who seek the throne</span>.
          </p>
        </div>
      </AnimatedSection>

      {/* --- Final CTA --- */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-blue-900/20 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(59,130,246,0.3),rgba(0,0,0,0))]" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h2 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            The Throne is Empty.
          </h2>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Stop preparing. Start conquering.
          </p>
          <button
            onClick={handleAuthRedirect}
            className="group relative px-12 py-5 font-bold bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Enter The Forge</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 border-t border-white/10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h3 className="font-black text-4xl mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">BePro</h3>
              <p className="text-xl text-gray-300 mb-6 max-w-md">Learn smart. Build loud. Get hired.</p>
              <div className="flex space-x-4">
                {['Twitter', 'Discord', 'LinkedIn'].map((social) => (
                  <button key={social} className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center hover:scale-110 transition-transform duration-200">
                    <span className="text-xs font-medium">{social[0]}</span>
                  </button>
                ))}
              </div>
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
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-fade-in-down { 
          animation: fade-in-down 1s ease-out forwards; 
        }
        .animate-fade-in-up { 
          animation: fade-in-up 1s ease-out forwards; 
          opacity: 0;
        }
        .animate-reverse {
          animation-direction: reverse;
        }
        .shimmer-bg {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
