'use client'

export default function RoadmapGrid({ missions }) {
  if (!missions || Object.keys(missions).length === 0) {
    return <p className="text-gray-500">No roadmap found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(missions).map(([id, item]) => (
        <div
          key={id}
          className="group relative p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-transform duration-500 ease-in-out cursor-pointer overflow-hidden"
        >

          <h3 className="text-xl font-semibold text-white drop-shadow-sm group-hover:opacity-0 group-hover:scale-105 group-hover:translate-y-[-10px] transition-transform duration-300">
            {item.title}
          </h3>

          <div className="absolute inset-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out z-10 rounded-xl overflow-y-auto">
            <p className="text-sm text-white/90 leading-relaxed animate-fade-in-up">
              {item.content.slice(0, 150)}...
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
