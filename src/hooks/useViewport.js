import { useState, useEffect } from 'react';

export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isNarrow: typeof window !== 'undefined' ? window.innerWidth < 480 : false,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 640 && window.innerWidth < 1024 : false,
    isShort: typeof window !== 'undefined' ? window.innerHeight < 800 : false,
    isCompactHeight: typeof window !== 'undefined' ? window.innerHeight < 520 : false,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isNarrow: window.innerWidth < 480,
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
        isShort: window.innerHeight < 800,
        isCompactHeight: window.innerHeight < 520,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
