'use client'

export default function LoadingSection() {
  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="w-8 h-8 lg:w-12 lg:h-12 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin"></div>
      <p className="mt-4 text-black font-semibold text-sm lg:text-base">Loading...</p>
    </div>
  );
}