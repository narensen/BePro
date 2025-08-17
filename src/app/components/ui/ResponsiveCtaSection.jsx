export default function   ResponsiveCtaSection({ user, onAuthAction }) {
  return (
    <section className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-xl" />
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 text-white">
          The Throne is Empty.
        </h2>
        <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-900 mb-8 sm:mb-12 leading-relaxed font-bold">
          Stop preparing. Start conquering.
        </p>
        <button 
          onClick={onAuthAction} 
          className="group relative w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 font-bold bg-gray-900 text-gray-300 rounded-2xl text-xl sm:text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
        >
          <span className="relative z-10">{user ? 'Enter The Forge' : 'Claim Your Throne'}</span>
          <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </section>
  );
}