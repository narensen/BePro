export const CtaSection = ({ user, onAuthAction }) => (
  <section className="py-32 px-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-white/10 to-gray-900/30 backdrop-blur-xl" />
    <div className="relative z-10 max-w-6xl mx-auto text-center">
      <h2 className="text-6xl md:text-8xl font-black mb-8 text-white">The Throne is Empty.</h2>
      <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-900 mb-12 leading-relaxed font-bold">
        Stop preparing. Start conquering.
      </p>
      <button onClick={onAuthAction} className="group relative px-12 py-5 font-bold bg-gray-900 text-amber-300 rounded-2xl text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer">
        <span className="relative z-10">{user ? 'Enter The Forge' : 'Claim Your Throne'}</span>
        <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </div>
  </section>
);