export function ResponsiveFooter() {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-white/20 px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-black text-3xl sm:text-4xl mb-3 sm:mb-4 text-white">BePro</h3>
            <p className="text-lg sm:text-xl text-gray-900 mb-3 sm:mb-4 max-w-md font-bold">
              Learn smart. Build loud. Get hired.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-white">Product</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['Features', 'Pricing', 'Roadmap', 'API'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors font-bold text-sm sm:text-base">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-white">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['Help Center', 'Contact', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors font-bold text-sm sm:text-base">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-4 sm:pt-6 border-t border-white/20 text-center">
          <p className="text-gray-300 font-bold text-sm sm:text-base">
            © {new Date().getFullYear()} BePro Inc. The Forge is Open.
          </p>
        </div>
      </div>
    </footer>
  );
}