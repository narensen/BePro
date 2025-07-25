export const Footer = () => (
  <footer className="bg-gray-900/50 backdrop-blur-xl border-t border-white/20 px-6 py-20">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <h3 className="font-black text-4xl mb-6 text-white">BePro</h3>
          <p className="text-xl text-gray-300 mb-6 max-w-md font-bold">Learn smart. Build loud. Get hired.</p>
        </div>
        <div>
          <h4 className="font-bold text-xl mb-6 text-white">Product</h4>
          <ul className="space-y-3">
            {['Features', 'Pricing', 'Roadmap', 'API'].map((item) => (<li key={item}><a href="#" className="text-gray-400 hover:text-white transition-colors font-bold">{item}</a></li>))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-xl mb-6 text-white">Support</h4>
          <ul className="space-y-3">
            {['Help Center', 'Contact', 'Privacy', 'Terms'].map((item) => (<li key={item}><a href="#" className="text-gray-400 hover:text-white transition-colors font-bold">{item}</a></li>))}
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-white/20 text-center">
        <p className="text-gray-400 font-bold">© {new Date().getFullYear()} BePro Inc. The Forge is Open.</p>
      </div>
    </div>
  </footer>
);