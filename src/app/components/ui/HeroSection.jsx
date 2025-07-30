import React, { useState, useEffect } from 'react';

export const HeroSection = ({ user, onAuthAction }) => {
  const brutalTruths = [
    "Your professor's entire 'career' is a decade-old PDF and a projector. And you’re trusting them to shape your future?",
    "You’re being taught software by people who’ve never opened GitHub. That’s not a degree. That’s a scam.",
    "They hand out attendance for breathing and call it ‘education.’ No builds. No battles. Just boredom.",
    "If you’re still clapping for people who’ve never built sh*t, maybe mediocrity isn’t your enemy. It’s your mirror.",
    "Universities here don’t prepare you for the real world. They prepare you for unemployment with a certificate.",
    "You’re being trained by gatekeepers who failed at the game—so they teach it instead."
  ];

  const headlineCombos = [
    { top: "Burn the Notes.", bottom: "Build the Future." },
    { top: "Lecture Halls Don’t Make Leaders.", bottom: "Products Do." },
    { top: "You Can’t Deploy a Degree.", bottom: "But You Can Deploy Product." }
  ];

  const [lineIndex, setLineIndex] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % brutalTruths.length);
      setHeadlineIndex((prev) => (prev + 1) % headlineCombos.length);
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/50 via-amber-400/50 to-orange-400/50" />
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight transition-opacity duration-500 ease-in-out">
          <span className="text-gray-900 animate-fade-in-down">
            {headlineCombos[headlineIndex].top}
          </span>
          <br />
          <span className="text-white animate-fade-in-up">
            {headlineCombos[headlineIndex].bottom}
          </span>
        </h1>

        <p
          key={lineIndex}
          className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-800 mb-12 leading-relaxed font-bold transition-opacity duration-500 ease-in-out animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          {brutalTruths[lineIndex]}
        </p>

        <div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up"
          style={{ animationDelay: '0.8s' }}
        >
          <button
            onClick={onAuthAction}
            className="group relative px-10 py-4 font-bold bg-gray-900 text-amber-300 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10">
              {user ? 'Enter Dashboard' : 'Begin Your Ascent'}
            </span>
            <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};
