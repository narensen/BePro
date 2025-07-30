export const CodexIcon = ({ className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-xl"></div>
    <svg xmlns="http://www.w3.org/2000/svg" className="relative h-12 w-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18M5.468 18.37A8.962 8.962 0 0112 3c1.933 0 3.741.61 5.232 1.628a8.962 8.962 0 01-1.232 12.118A8.962 8.962 0 015.468 18.37z" />
    </svg>
  </div>
);