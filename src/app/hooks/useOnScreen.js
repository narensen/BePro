import { useState, useEffect, useRef } from 'react';

export const useOnScreen = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { threshold = 0.1 } = options;

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return [ref, isVisible];
};