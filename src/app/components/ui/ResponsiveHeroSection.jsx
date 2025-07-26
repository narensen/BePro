export default function ResponsiveHeroSection({ user, onAuthAction }) {
  return (
    <section className="min-h-screen flex items-center justify-center relative pt-20 px-4 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/50 via-amber-400/50 to-orange-400/50" />
      <div className="relative z-10 text-center max-w-6xl mx-auto w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight">
          <span className="text-gray-900 animate-fade-in-down block sm:inline">Stop Learning.</span>
          <br className="hidden sm:block" />
          <span className="text-white animate-fade-in-up block sm:inline">Start Commanding.</span>
        </h1>
        <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-800 mb-8 sm:mb-12 leading-relaxed animate-fade-in-up font-bold px-4" style={{ animationDelay: '0.5s' }}>
          The world is drowning in courses and cringe-worthy networks. The top 1% are being forged elsewhere.
          <span className="text-gray-900 block sm:inline"> Welcome to the forge.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in-up px-4" style={{ animationDelay: '0.8s' }}>
          <button 
            onClick={onAuthAction} 
            className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 font-bold bg-gray-900 text-amber-300 rounded-2xl text-lg sm:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10">{user ? 'Enter Dashboard' : 'Begin Your Ascent'}</span>
            <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
}