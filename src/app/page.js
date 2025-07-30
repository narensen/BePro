'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Brain, Target, Menu, X } from 'lucide-react';

import { supabase } from '@/app/lib/supabase_client';
import useUserStore from '@/app/store/useUserStore';
import { useMousePosition } from '@/app/hooks/useMousePosition';

import { LoadingScreen } from '@/app/components/ui/LoadingScreen';
import ResponsiveHeader from '@/app/components/ui/ResponsiveHeader';
import ResponsiveHeroSection from '@/app/components/ui/ResponsiveHeroSection';
import { AnimatedSection } from '@/app/components/ui/AnimatedSection';
import ResponsiveInteractiveDemo from '@/app/components/ui/ResponsiveInteractiveDemo';
import ResponsiveFeatureCard from '@/app/components/ui/ResponsiveFeatureCard';
import ResponsiveCtaSection from '@/app/components/ui/ResponsiveCtaSection';
import ResponsiveFooter from '@/app/components/ui/ResponsiveFooter';
import { FloatingElement } from '@/app/components/ui/FloatingElement';

import { CodexIcon } from '@/app/components/icons/CodexIcon';
import { FortressIcon } from '@/app/components/icons/FortressIcon';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const { user, setUserSession, clearUserSession } = useUserStore();
  const router = useRouter();
  const mousePosition = useMousePosition();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else if (data.session) {
        setUserSession(data.session.user);
      } else {
        clearUserSession();
      }
      setLoading(false);
    };
    checkUser();
  }, [setUserSession, clearUserSession]);

  const handleAuthAction = () => {
    if (user) {
      router.push('/home');
    } else {
      router.push('/auth');
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearUserSession();
    router.push('/');
  };
  
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    // overflow-x-hidden is crucial for preventing horizontal scroll on mobile
    <main className="relative bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 overflow-x-hidden font-mono">
      {/* This mouse-following effect is decorative. It gracefully degrades on touch devices. */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent 40%)`,
        }}
      />
      
      {/* Responsive Floating Elements: Adjusted size and position for smaller screens */}
      <FloatingElement delay={0} className="absolute top-16 left-4 md:top-20 md:left-10 opacity-20">
        <Code2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />
      </FloatingElement>
      <FloatingElement delay={2} className="absolute top-40 right-4 md:right-20 opacity-20">
        <Brain className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
      </FloatingElement>
      <FloatingElement delay={4} className="absolute bottom-40 left-4 md:left-20 opacity-20">
        <Target className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
      </FloatingElement>
      
      <ResponsiveHeader user={user} onAuthAction={handleAuthAction} onSignOut={handleSignOut} />

      <ResponsiveHeroSection user={user} onAuthAction={handleAuthAction} />

      {/* Responsive Section Padding: Reduced vertical padding on mobile (py-20) and increased on larger screens (sm:py-24, md:py-32) */}
      <AnimatedSection className="py-20 sm:py-24 md:py-32 px-4 sm:px-6" background="bg-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          {/* Responsive Margins: Reduced bottom margin on mobile (mb-12) and increased on larger screens (md:mb-20) */}
          <div className="text-center mb-12 md:mb-20">
            {/* Responsive Typography: Added more breakpoints for smoother font size scaling */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 text-gray-900">Meet Your <span className="text-white">AI Mentor</span></h2>
            <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-800 leading-relaxed font-bold">
              Like having a senior developer watching over your shoulder. Your AI mentor provides instant feedback and guides you towards mastery.
            </p>
          </div>
          <div className="max-w-4xl mx-auto"><ResponsiveInteractiveDemo /></div>
        </div>
      </AnimatedSection>
      
      <AnimatedSection className="py-20 sm:py-24 md:py-32 px-4 sm:px-6" background="backdrop-blur-xl">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 text-white">The Illusion of Progress</h2>
          <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-900 leading-relaxed font-bold">
            You&apos;ve done everything they told you to. You&apos;ve taken the courses. You&apos;ve collected the certificates. 
            And yet, you are still at the bottom of the mountain.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection id="codex" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6" background="bg-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 text-gray-900">The <span className="text-white">Codex</span>: Your AI Mentor</h2>
            <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-800 leading-relaxed font-bold">
             The Codex deconstructs the path to any elite tech role and creates a personalized, step-by-step roadmap for your conquest.
            </p>
          </div>
          {/* This grid is already responsive: it stacks on mobile and becomes 3 columns on medium screens and up. This is a great pattern. */}
          <div className="grid md:grid-cols-3 gap-8">
            <ResponsiveFeatureCard icon={<CodexIcon />} title="Deconstruction" description="The Codex analyzes thousands of data points to generate a master blueprint of the exact skills and projects required." delay={0} />
            <ResponsiveFeatureCard icon={<CodexIcon />} title="Prescription" description="You receive a single, focused mission each week. The Codex provides the curated resources you need to win." delay={200} />
            <ResponsiveFeatureCard icon={<CodexIcon />} title="Validation" description="Your AI Mentor evaluates your work, pushing you to improve. Your profile becomes a living record of your mastery." delay={400} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="fortress" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6" background="backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 text-white">The <span className="text-gray-900">Community Fortress</span></h2>
                <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-900 leading-relaxed font-bold">
                    Compete, collaborate, and conquer alongside the best commanders from your own college.
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <ResponsiveFeatureCard icon={<FortressIcon />} title="College-Specific" description="Join a private fortress accessible only to students from your university, verified by your college email." delay={0} />
                <ResponsiveFeatureCard icon={<FortressIcon />} title="Inter-Community Raids" description="Participate in challenges against other universities to prove who forges the best commanders." delay={200} />
                <ResponsiveFeatureCard icon={<FortressIcon />} title="Recruit Your Allies" description="Find your future co-founders within a high-trust network of the most ambitious builders on your campus." delay={400} />
            </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="philosophy" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6" background="bg-white/10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 md:mb-12 text-white">This Is Not For Everyone.</h2>
          <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-800 leading-relaxed font-bold">
            We are not for the casual learner; we are for the <span className="text-gray-900">obsessed builder</span>. We are not for the 95% who seek comfort; we are for the <span className="text-white">5% who seek the throne</span>.
          </p>
        </div>
      </AnimatedSection>

      <ResponsiveCtaSection user={user} onAuthAction={handleAuthAction} />
      
      <ResponsiveFooter />

      {/* No changes needed here. Animations are not screen-size dependent. */}
      <style jsx>{`
        @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .animate-fade-in-down { animation: fade-in-down 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </main>
  );
}