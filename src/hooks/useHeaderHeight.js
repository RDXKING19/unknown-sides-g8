import { useEffect } from 'react';

export function useHeaderHeight(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const set = () => {
      if (ref.current) {
        document.documentElement.style.setProperty('--header-h', `${ref.current.offsetHeight}px`);
      }
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
}
