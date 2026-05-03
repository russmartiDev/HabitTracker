'use client';

import { useEffect, useState } from 'react';
import {
  ACCENT_NAMES,
  applyTheme,
  readPrefs,
  type AccentName,
  type ThemeName,
} from './ThemeApplier';

export function SettingsThemePicker() {
  const [theme, setTheme] = useState<ThemeName>('warm');
  const [accent, setAccent] = useState<AccentName>('terracotta');

  useEffect(() => {
    const p = readPrefs();
    setTheme(p.theme);
    setAccent(p.accent);
  }, []);

  function pickAccent(a: AccentName) {
    setAccent(a);
    localStorage.setItem('lichen.accent', a);
    applyTheme(theme, a);
  }
  function pickTheme(t: ThemeName) {
    setTheme(t);
    localStorage.setItem('lichen.theme', t);
    applyTheme(t, accent);
  }

  return (
    <div className="col gap-16">
      <div>
        <div className="t-label" style={{ marginBottom: 6 }}>
          Accent
        </div>
        <div className="row gap-6 wrap">
          {ACCENT_NAMES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => pickAccent(a)}
              className={`chip ${accent === a ? 'chip-active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="t-label" style={{ marginBottom: 6 }}>
          Theme
        </div>
        <div className="row gap-6 wrap">
          {(['warm', 'evening'] as ThemeName[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => pickTheme(t)}
              className={`chip ${theme === t ? 'chip-active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {t === 'warm' ? 'Cream' : 'Evening'}
            </button>
          ))}
        </div>
      </div>

      <p className="tiny faint">Stored locally per browser. Changes apply instantly.</p>
    </div>
  );
}
