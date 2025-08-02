'use client'

export default function DateSeparator({ dateLabel }) {
  return (
    <div className="flex items-center justify-center my-6">
      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200">
        <span className="text-gray-600 text-sm font-semibold">{dateLabel}</span>
      </div>
    </div>
  );
}