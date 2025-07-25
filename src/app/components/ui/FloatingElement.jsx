export const FloatingElement = ({ children, delay = 0, className = "" }) => (
  <div className={`animate-float ${className}`} style={{ animationDelay: `${delay}s` }}>
    {children}
  </div>
);