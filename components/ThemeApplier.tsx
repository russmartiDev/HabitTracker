'use client';

import { useEffect } from 'react';

const ACCENT_PRESETS: Record<string, { accent: string; deep: string; soft: string; tint: string }> = {
  terracotta: { accent: '0.62 0.14 40', deep: '0.52 0.15 38', soft: '0.92 0.045 50', tint: '0.96 0.025 55' },
  ochre:      { accent: '0.68 0.13 75', deep: '0.55 0.13 75', soft: '0.93 0.05 80', tint: '0.96 0.03 80' },
  sage:       { accent: '0.55 0.10 145', deep: '0.45 0.10 145', soft: '0.92 0.04 145', tint: '0.96 0.025 145' },
  plum:       { accent: '0.50 0.10 320', deep: '0.40 0.10 320', soft: '0.92 0.03 320', tint: '0.96 0.02 320' },
  ink:        { accent: '0.30 0.02 60', deep: '0.20 0.015 50', soft: '0.86 0.018 70', tint: '0.95 0.012 80' },
};

export type ThemeName = 'warm' | 'evening';
export type AccentName = keyof typeof ACCENT_PRESETS;

export const ACCENT_NAMES = Object.keys(ACCENT_PRESETS) as AccentName[];

export function readPrefs(): { theme: ThemeName; accent: AccentName } {
  if (typeof window === 'undefined') return { theme: 'warm', accent: 'terracotta' };
  const theme = (localStorage.getItem('lichen.theme') as ThemeName) || 'warm';
  const accent = (localStorage.getItem('lichen.accent') as AccentName) || 'terracotta';
  return { theme, accent: ACCENT_PRESETS[accent] ? accent : 'terracotta' };
}

export function applyTheme(theme: ThemeName, accent: AccentName) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-accent', accent);
  const p = ACCENT_PRESETS[accent] ?? ACCENT_PRESETS.terracotta;
  root.style.setProperty('--accent', `oklch(${p.accent})`);
  root.style.setProperty('--accent-deep', `oklch(${p.deep})`);
  root.style.setProperty('--accent-soft', `oklch(${p.soft})`);
  root.style.setProperty('--accent-tint', `oklch(${p.tint})`);
}

/** Mounts on the client and applies the stored theme/accent preferences. */
export function ThemeApplier() {
  useEffect(() => {
    const { theme, accent } = readPrefs();
    applyTheme(theme, accent);
  }, []);
  return null;
}
