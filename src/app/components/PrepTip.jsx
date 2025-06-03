export default function PrepTip({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="text-4xl bg-gradient-to-r from-amber-400 to-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-xl mb-3 text-gray-900">{title}</h4>
        <p className="text-gray-700 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}