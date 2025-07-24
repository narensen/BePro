'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Eye, Brain, Zap, Users, BookOpen, Target, ArrowRight, CheckCircle, AlertCircle, MessageSquare, Code2, Sparkles, Shield, Trophy, Rocket, Star } from 'lucide-react'

// Enhanced SVG Icons
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

// Advanced Hooks
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
  }, [options]);

  return [ref, isVisible];
};

// AI Mentor Feedback Component
const AIMentorFeedback = ({ isTyping, text, feedback }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  
  useEffect(() => {
    if (isTyping && text.length > 3) {
      const timer = setTimeout(() => setShowFeedback(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowFeedback(false);
    }
  }, [isTyping, text]);
  
  if (!showFeedback) return null;
  
  return (
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full z-50">
      <div className="relative">
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent border-t-gray-900"></div>
        <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/30 min-w-64 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">AI Mentor</p>
              <p className="text-sm leading-tight">{feedback.message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Demo Component
const InteractiveDemo = () => {
  const [code, setCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  
  const feedbackRules = [
    { pattern: /function\s+\w+\(\s*\)\s*{/, message: "Excellent! Clean function declaration. Consider adding parameter types for better maintainability.", type: 'success' },
    { pattern: /var\s+/, message: "Hold on! Use 'let' or 'const' instead of 'var' for better scope control and modern JS practices.", type: 'correction' },
    { pattern: /console\.log\(/, message: "Perfect for debugging! Remember to remove console.logs before production deployment.", type: 'success' },
    { pattern: /=\s*=(?!=)/, message: "Stop right there! Use '===' for strict equality to avoid type coercion issues.", type: 'correction' },
    { pattern: /\bif\s*\(.*\)\s*{/, message: "Great conditional logic! Make sure to handle edge cases and error conditions.", type: 'success' },
    { pattern: /class\s+\w+/, message: "Nice! Object-oriented approach. Consider using composition over inheritance when possible.", type: 'success' }
  ];
  
  useEffect(() => {
    if (!code) {
      setCurrentFeedback(null);
      return;
    }
    
    for (const rule of feedbackRules) {
      if (rule.pattern.test(code)) {
        setCurrentFeedback(rule);
        break;
      }
    }
  }, [code]);
  
  const handleInputChange = (e) => {
    setCode(e.target.value);
    setIsTyping(true);
    
    setTimeout(() => setIsTyping(false), 1500);
  };
  
  return (
    <div className="relative">
      <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
            <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
          </div>
          <span className="ml-4 text-gray-400 text-sm font-mono">main.js - AI Mentor Active</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={code}
            onChange={handleInputChange}
            placeholder="// Start typing JavaScript code here...
// Try: function hello() {
// Try: var name = 'John'  
// Try: if (user == null) {
// Try: class MyComponent {"
            className="w-full h-48 bg-transparent text-green-400 font-mono text-sm resize-none outline-none placeholder-gray-500/70 leading-relaxed"
            spellCheck={false}
          />
          
          {currentFeedback && (
            <AIMentorFeedback 
              isTyping={isTyping} 
              text={code} 
              feedback={currentFeedback} 
            />
          )}
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-amber-400 text-sm font-bold">AI Mentor</p>
              <p className="text-gray-400 text-xs">Watching your code in real-time</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Feedback Delay</p>
            <p className="text-amber-400 text-sm font-bold">~0.8s</p>
          </div>
        </div>
      </div>
      
      {/* Floating indicators */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

// Floating Animation Component
const FloatingElement = ({ children, delay = 0, className = "" }) => {
  return (
    <div 
      className={`animate-float ${className}`}
      style={{ 
        animationDelay: `${delay}s`
      }}
    >
      {children}
    </div>
  );
};

// Interactive Feature Card
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const [ref, isVisible] = useOnScreen();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={`relative p-8 rounded-3xl backdrop-blur-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/20 transition-all duration-700 hover:scale-105 hover:border-amber-400/50 group cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
      
      <div className="relative z-10">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {icon}
            {isHovered && (
              <div className="absolute inset-0 animate-ping">
                {icon}
              </div>
            )}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 text-center">{title}</h3>
        <p className="text-gray-300 text-center leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// Animated Section Component
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

// Main App Component
export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const mousePosition = useMousePosition();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthRedirect = () => {
    console.log('Redirecting to auth...');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 flex items-center justify-center font-mono">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparkleIcon className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-white font-bold mt-4 text-center">Initializing AI Mentor...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 overflow-x-hidden font-mono">
      {/* Dynamic background with mouse interaction */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent 40%)`,
        }}
      />
      
      {/* Floating background elements */}
      <FloatingElement delay={0} className="absolute top-20 left-10 opacity-20">
        <Code2 className="w-16 h-16 text-white" />
      </FloatingElement>
      <FloatingElement delay={2} className="absolute top-40 right-20 opacity-20">
        <Brain className="w-12 h-12 text-white" />
      </FloatingElement>
      <FloatingElement delay={4} className="absolute bottom-40 left-20 opacity-20">
        <Target className="w-14 h-14 text-white" />
      </FloatingElement>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6">
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl px-8 py-4 mx-auto max-w-7xl shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-black text-gray-900">
              BePro
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#codex" className="text-gray-800 hover:text-gray-900 transition-colors font-bold">The Codex</a>
              <a href="#fortress" className="text-gray-800 hover:text-gray-900 transition-colors font-bold">The Fortress</a>
              <a href="#philosophy" className="text-gray-800 hover:text-gray-900 transition-colors font-bold">The Philosophy</a>
            </nav>
            <div>
              {user ? (
                <button className="px-6 py-3 font-bold bg-gray-900 text-amber-300 rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg">
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={handleAuthRedirect}
                  className="px-6 py-3 font-bold bg-gray-900 text-amber-300 rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Enter The Forge
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/50 via-amber-400/50 to-orange-400/50" />
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="text-gray-900 animate-fade-in-down">
              Stop Learning.
            </span>
            <br />
            <span className="text-white animate-fade-in-up">
              Start Commanding.
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-800 mb-12 leading-relaxed animate-fade-in-up font-bold" style={{ animationDelay: '0.5s' }}>
            The world is drowning in courses and cringe-worthy networks. The top 1% are being forged elsewhere. 
            <span className="text-gray-900"> Welcome to the forge.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <button
              onClick={handleAuthRedirect}
              className="group relative px-10 py-4 font-bold bg-gray-900 text-amber-300 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Begin Your Ascent</span>
              <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* AI Mentor Demo Section */}
      <AnimatedSection className="py-32 px-4" background="bg-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-gray-900">
              Meet Your <span className="text-white">AI Mentor</span>
            </h2>
            <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-800 leading-relaxed font-bold">
              Like having a senior developer watching over your shoulder. Your AI mentor provides instant feedback, 
              catches mistakes before they become problems, and guides you towards mastery.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <InteractiveDemo />
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-800 font-bold">👆 Try typing some JavaScript code above and watch the magic happen</p>
          </div>
        </div>
      </AnimatedSection>

      {/* Problem Section */}
      <AnimatedSection className="py-32 px-4" background="bg-gray-900/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
            The Illusion of Progress
          </h2>
          <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-900 leading-relaxed font-bold">
            You&apos;ve done everything they told you to. You&apos;ve taken the courses. You&apos;ve collected the certificates. 
            And yet, you are still at the bottom of the mountain. The tools you have been given are designed to make you 
            <span className="text-white"> a better soldier</span>, not 
            <span className="text-white"> the emperor</span>.
          </p>
        </div>
      </AnimatedSection>

      {/* Solution Section (The Codex) */}
      <AnimatedSection id="codex" className="py-32 px-4" background="bg-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-gray-900">
              The <span className="text-white">Codex</span>: Your AI Mentor
            </h2>
            <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-800 leading-relaxed font-bold">
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

      {/* Community Section */}
      <AnimatedSection id="fortress" className="py-32 px-4" background="bg-gray-900/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
              The <span className="text-gray-900">Community Fortress</span>
            </h2>
            <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-900 leading-relaxed font-bold">
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

      {/* Philosophy Section */}
      <AnimatedSection id="philosophy" className="py-32 px-4" background="bg-white/10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-12 text-white">
            This Is Not For Everyone.
          </h2>
          <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-800 leading-relaxed font-bold">
            BePro is not a public park. It is a fortress where warriors are forged. We are not for the casual learner; 
            we are for the <span className="text-gray-900">obsessed builder</span>. We are not for the 95% who seek comfort; 
            we are for the <span className="text-white">5% who seek the throne</span>.
          </p>
        </div>
      </AnimatedSection>

      {/* Final CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-white/10 to-gray-900/30 backdrop-blur-xl" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h2 className="text-6xl md:text-8xl font-black mb-8 text-white">
            The Throne is Empty.
          </h2>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-900 mb-12 leading-relaxed font-bold">
            Stop preparing. Start conquering.
          </p>
          <button
            onClick={handleAuthRedirect}
            className="group relative px-12 py-5 font-bold bg-gray-900 text-amber-300 rounded-2xl text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Enter The Forge</span>
            <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-xl border-t border-white/20 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h3 className="font-black text-4xl mb-6 text-white">BePro</h3>
              <p className="text-xl text-gray-300 mb-6 max-w-md font-bold">Learn smart. Build loud. Get hired.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-6 text-white">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Roadmap', 'API'].map((item) => (
                  <li key={item}>
                    <a href={`/${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors font-bold">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Contact', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <a href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition-colors font-bold">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/20 text-center">
            <p className="text-gray-400 font-bold">© {new Date().getFullYear()} BePro Inc. The Forge is Open.</p>
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in-down { 
          animation: fade-in-down 1s ease-out forwards; 
        }
        .animate-fade-in-up { 
          animation: fade-in-up 1s ease-out forwards; 
          opacity: 0;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
