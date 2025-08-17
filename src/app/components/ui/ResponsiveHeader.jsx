'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
export default function ResponsiveHeader({ user, onAuthAction, onSignOut }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-4">
      <div className="backdrop-blur-2xl bg-warm-beige/10 border border-light-gray/20 rounded-2xl px-4 sm:px-6 py-2 sm:py-3 mx-auto max-w-7xl shadow-2xl">
        <div className="flex justify-between items-center">
          {}
          <div className="text-2xl sm:text-3xl font-black text-deep-navy">BePro</div>
          
          {}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <a href="#codex" className="text-deep-navy/80 hover:text-deep-navy transition-colors font-bold text-sm lg:text-base">The Codex</a>
            <a href="#fortress" className="text-deep-navy/80 hover:text-deep-navy transition-colors font-bold text-sm lg:text-base">The Fortress</a>
            <a href="#philosophy" className="text-deep-navy/80 hover:text-deep-navy transition-colors font-bold text-sm lg:text-base">The Philosophy</a>
          </nav>
          
          {}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {user ? (
              <>
                <button 
                  onClick={() => router.push('/home')} 
                  className="px-4 lg:px-6 py-2 lg:py-3 font-bold bg-muted-terracotta text-warm-beige rounded-xl hover:bg-terracotta-600 transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer text-sm lg:text-base"
                >
                  Dashboard
                </button>
                <button 
                  onClick={onSignOut} 
                  className="px-3 lg:px-4 py-2 lg:py-3 font-bold text-deep-navy/80 hover:text-deep-navy transition-colors cursor-pointer text-sm lg:text-base"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={onAuthAction} 
                className="px-4 lg:px-6 py-2 lg:py-3 font-bold bg-muted-terracotta text-warm-beige rounded-xl hover:bg-terracotta-600 transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer text-sm lg:text-base"
              >
                Enter The Forge
              </button>
            )}
          </div>

          {}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-deep-navy hover:bg-warm-beige/20 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-light-gray/20">
            <nav className="flex flex-col space-y-3 mb-4">
              <a 
                href="#codex" 
                className="text-deep-navy/80 hover:text-deep-navy transition-colors font-bold py-2 px-2 rounded-lg hover:bg-warm-beige/20"
                onClick={() => setIsMenuOpen(false)}
              >
                The Codex
              </a>
              <a 
                href="#fortress" 
                className="text-deep-navy/80 hover:text-deep-navy transition-colors font-bold py-2 px-2 rounded-lg hover:bg-warm-beige/20"
                onClick={() => setIsMenuOpen(false)}
              >
                The Fortress
              </a>
              <a 
                href="#philosophy" 
                className="text-deep-navy/80 hover:text-deep-navy transition-colors font-bold py-2 px-2 rounded-lg hover:bg-warm-beige/20"
                onClick={() => setIsMenuOpen(false)}
              >
                The Philosophy
              </a>
            </nav>
            
            {}
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <button 
                    onClick={() => {
                      router.push('/home');
                      setIsMenuOpen(false);
                    }} 
                    className="w-full px-4 py-3 font-bold bg-muted-terracotta text-warm-beige rounded-xl hover:bg-terracotta-600 transition-all duration-300 shadow-lg cursor-pointer"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      onSignOut();
                      setIsMenuOpen(false);
                    }} 
                    className="w-full px-4 py-3 font-bold text-deep-navy hover:text-deep-navy transition-colors cursor-pointer border border-deep-navy rounded-xl hover:bg-warm-beige/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    onAuthAction();
                    setIsMenuOpen(false);
                  }} 
                  className="w-full px-4 py-3 font-bold bg-muted-terracotta text-warm-beige rounded-xl hover:bg-terracotta-600 transition-all duration-300 shadow-lg cursor-pointer"
                >
                  Enter The Forge
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}