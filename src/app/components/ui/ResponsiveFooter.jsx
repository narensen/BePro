export default function ResponsiveFooter() {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-xl border-t border-white/20 px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-black text-3xl sm:text-4xl mb-4 sm:mb-6 text-white">BePro</h3>
            <p className="text-lg sm:text-xl text-gray-300 mb-4 sm:mb-6 max-w-md font-bold">
              Learn smart. Build loud. Get hired.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-white">Product</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['Features', 'Pricing', 'Roadmap', 'API'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors font-bold text-sm sm:text-base">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-white">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['Help Center', 'Contact', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors font-bold text-sm sm:text-base">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-6 sm:pt-8 border-t border-white/20 text-center">
          <p className="text-gray-400 font-bold text-sm sm:text-base">
            © {new Date().getFullYear()} BePro Inc. The Forge is Open.
          </p>
        </div>
      </div>
    </footer>
  );
}