'use client';

import { useRouter } from 'next/navigation';

export const Header = ({ user, onAuthAction, onSignOut }) => {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6">
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl px-8 py-4 mx-auto max-w-7xl shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="text-3xl font-black text-gray-900">BePro</div>
          <nav className="hidden md:flex space-x-8">
            <a href="#codex" className="text-gray-800 hover:text-gray-900 transition-colors font-bold">The Codex</a>
            <a href="#fortress" className="text-gray-800 hover:text-gray-900 transition-colors font-bold">The Fortress</a>
            <a href="#philosophy" className="text-gray-800 hover:text-gray-900 transition-colors font-bold">The Philosophy</a>
          </nav>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => router.push('/home')} className="px-6 py-3 font-bold bg-gray-900 text-amber-300 rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer">
                  Dashboard
                </button>
                <button onClick={onSignOut} className="px-4 py-3 font-bold text-gray-800 hover:text-gray-900 transition-colors cursor-pointer">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={onAuthAction} className="px-6 py-3 font-bold bg-gray-900 text-amber-300 rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer">
                Enter The Forge
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};