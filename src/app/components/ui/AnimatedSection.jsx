'use client';

import { useOnScreen } from '@/app/hooks/useOnScreen';

export const AnimatedSection = ({ children, className = "", background = "", id = "" }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  
  return (
    <section ref={ref} id={id} className={`relative ${className} ${background} transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </section>
  );
};