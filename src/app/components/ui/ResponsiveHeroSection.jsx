import React, { useState, useEffect } from 'react';

export default function ResponsiveHeroSection({ user, onAuthAction }) {
  const brutalTruths = [
    "Your professor's entire 'career' is a decade-old PDF and a projector. And you're trusting them to shape your future?",
    "You're being taught software by people who've never opened GitHub. That's not a degree. That's a scam.",
    "They hand out attendance for breathing and call it 'education.' No builds. No battles. Just boredom.",
    "If you're still clapping for people who've never built sh*t, maybe mediocrity isn't your enemy. It's your mirror.",
    "Universities here don't prepare you for the real world. They prepare you for unemployment with a certificate.",
    "You're being trained by gatekeepers who failed at the game—so they teach it instead."
  ];

  const headlineCombos = [
    { top: "Burn the Notes.", bottom: "Build the Future." },
    { top: "Lecture Halls Don't Make Leaders.", bottom: "Products Do." },
    { top: "You Can't Deploy a Degree,", bottom: "but a Product." }
  ];

  const [lineIndex, setLineIndex] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setLineIndex((prev) => (prev + 1) % brutalTruths.length);
        setHeadlineIndex((prev) => (prev + 1) % headlineCombos.length);
        setIsTransitioning(false);
      }, 300);  
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative pt-20 px-4 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-deep-navy/50 via-warm-beige/50 to-cool-teal/50" />
      <div className="relative z-10 text-center max-w-6xl mx-auto w-full">
        <div className="mb-4 sm:mb-6 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] flex flex-col justify-center">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight transition-all duration-500 ease-in-out transform ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            <div className="text-deep-navy mb-2 sm:mb-4">
              {headlineCombos[headlineIndex].top}
            </div>
            <div className="text-muted-terracotta">
              {headlineCombos[headlineIndex].bottom}
            </div>
          </h1>
        </div>

        <div className="mb-8 sm:mb-12 h-[100px] sm:h-[90px] md:h-[80px] flex items-center justify-center">
          <p className={`max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-deep-navy/80 leading-relaxed font-bold px-4 transition-all duration-500 ease-in-out transform ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            {brutalTruths[lineIndex]}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in-up px-4">
          <button 
            onClick={onAuthAction} 
            className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 font-bold bg-muted-terracotta text-warm-beige rounded-2xl text-lg sm:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10">{user ? 'Enter Dashboard' : 'Begin Your Ascent'}</span>
            <div className="absolute inset-0 bg-terracotta-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
}