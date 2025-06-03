export default function FeatureCard({ icon, title, desc, gradient }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
      <div className={`text-5xl mb-6 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <h3 className="font-black text-xl mb-4 text-gray-900">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{desc}</p>
    </div>
  )
}