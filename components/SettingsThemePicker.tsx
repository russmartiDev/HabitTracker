'use client';

import { useEffect, useState } from 'react';
import { applyTheme, readTheme, type ThemeName } from './ThemeApplier';

export function SettingsThemePicker() {
  const [theme, setTheme] = useState<ThemeName>('warm');

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function pickTheme(t: ThemeName) {
    setTheme(t);
    localStorage.setItem('lichen.theme', t);
    applyTheme(t);
  }

  return (
    <div className="col gap-12">
      <div className="t-label">Theme</div>
      <div className="row gap-6 wrap">
        {(['warm', 'evening'] as ThemeName[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => pickTheme(t)}
            className={`chip ${theme === t ? 'chip-active' : ''}`}
          >
            {t === 'warm' ? 'Warm (default)' : 'Evening'}
          </button>
        ))}
      </div>
      <p className="tiny faint">
        Stored locally per browser. Changes apply instantly.
      </p>
    </div>
  );
}
