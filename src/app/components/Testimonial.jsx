export default function Testimonial({ name, role, quote }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
      <p className="italic mb-6 text-lg text-gray-700 leading-relaxed">&quot;{quote}&quot;</p>
      <div className="border-t border-gray-200 pt-4">
        <p className="font-black text-gray-900">{name}</p>
        <p className="text-gray-600 font-medium">{role}</p>
      </div>
    </div>
  )
}