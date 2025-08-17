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
      <div className="backdrop-blur-2xl bg-warm-beige/90 border border-terracotta/30 rounded-2xl px-4 sm:px-6 py-2 sm:py-3 mx-auto max-w-7xl shadow-2xl hover-lift">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl sm:text-3xl font-black text-deep-navy font-display">BePro</div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <a href="#codex" className="text-deep-navy/80 hover:text-terracotta transition-colors font-medium text-sm lg:text-base">The Codex</a>
            <a href="#fortress" className="text-deep-navy/80 hover:text-terracotta transition-colors font-medium text-sm lg:text-base">The Fortress</a>
            <a href="#philosophy" className="text-deep-navy/80 hover:text-terracotta transition-colors font-medium text-sm lg:text-base">The Philosophy</a>
          </nav>
          
          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {user ? (
              <>
                <button 
                  onClick={() => router.push('/home')} 
                  className="px-4 lg:px-6 py-2 lg:py-3 font-bold bg-terracotta text-white rounded-xl hover:bg-terracotta/90 transition-all duration-300 hover-lift shadow-lg cursor-pointer text-sm lg:text-base"
                >
                  Dashboard
                </button>
                <button 
                  onClick={onSignOut} 
                  className="px-3 lg:px-4 py-2 lg:py-3 font-medium text-deep-navy/80 hover:text-deep-navy transition-colors cursor-pointer text-sm lg:text-base"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={onAuthAction} 
                className="px-4 lg:px-6 py-2 lg:py-3 font-bold bg-terracotta text-white rounded-xl hover:bg-terracotta/90 transition-all duration-300 hover-lift shadow-lg cursor-pointer text-sm lg:text-base"
              >
                Enter The Forge
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-deep-navy hover:bg-terracotta/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-terracotta/20">
            <nav className="flex flex-col space-y-3 mb-4">
              <a 
                href="#codex" 
                className="text-deep-navy/80 hover:text-terracotta transition-colors font-medium py-2 px-2 rounded-lg hover:bg-terracotta/10"
                onClick={() => setIsMenuOpen(false)}
              >
                The Codex
              </a>
              <a 
                href="#fortress" 
                className="text-deep-navy/80 hover:text-terracotta transition-colors font-medium py-2 px-2 rounded-lg hover:bg-terracotta/10"
                onClick={() => setIsMenuOpen(false)}
              >
                The Fortress
              </a>
              <a 
                href="#philosophy" 
                className="text-deep-navy/80 hover:text-terracotta transition-colors font-medium py-2 px-2 rounded-lg hover:bg-terracotta/10"
                onClick={() => setIsMenuOpen(false)}
              >
                The Philosophy
              </a>
            </nav>
            
            {/* Mobile CTA Buttons */}
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <button 
                    onClick={() => {
                      router.push('/home');
                      setIsMenuOpen(false);
                    }} 
                    className="w-full px-4 py-3 font-bold bg-terracotta text-white rounded-xl hover:bg-terracotta/90 transition-all duration-300 shadow-lg cursor-pointer"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      onSignOut();
                      setIsMenuOpen(false);
                    }} 
                    className="w-full px-4 py-3 font-medium text-deep-navy/80 hover:text-deep-navy transition-colors cursor-pointer border border-deep-navy/20 rounded-xl hover:bg-terracotta/10"
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
                  className="w-full px-4 py-3 font-bold bg-terracotta text-white rounded-xl hover:bg-terracotta/90 transition-all duration-300 shadow-lg cursor-pointer"
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