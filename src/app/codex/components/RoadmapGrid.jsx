'use client'

export default function RoadmapGrid({ missions }) {
  if (!missions || Object.keys(missions).length === 0) {
    return <p className="text-gray-500">No roadmap found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(missions).map(([id, item]) => (
        <div key={id} className="border p-4 rounded-lg">
          <h3 className="font-bold">{item.title}</h3>
          <p>{item.content}</p>
        </div>
      ))}
    </div>
  );
}
