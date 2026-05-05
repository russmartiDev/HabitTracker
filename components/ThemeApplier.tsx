'use client';

import { useEffect } from 'react';

export type ThemeName = 'warm' | 'evening';

export function readTheme(): ThemeName {
  if (typeof window === 'undefined') return 'warm';
  const t = localStorage.getItem('lichen.theme') as ThemeName | null;
  return t === 'evening' ? 'evening' : 'warm';
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute('data-theme', theme);
}

/** Mounts on the client and applies the stored theme. */
export function ThemeApplier() {
  useEffect(() => {
    applyTheme(readTheme());
  }, []);
  return null;
}
