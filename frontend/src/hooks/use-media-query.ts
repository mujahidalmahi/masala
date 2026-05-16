'use client';

import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  const getSnapshot = () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches);
  const getServerSnapshot = () => false;
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }
    const mql = window.matchMedia(query);
    const listener = () => callback();
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
