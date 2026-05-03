'use client';

import { useEffect, useState } from 'react';
import { ACCENT_NAMES, applyTheme, readPrefs, type AccentName, type ThemeName } from './ThemeApplier';

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
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
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 100,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
      }}
    >
      {open && (
        <div
          className="card"
          style={{
            padding: 14,
            marginBottom: 8,
            width: 240,
            borderColor: 'var(--ink-soft)',
            background: 'var(--paper-warm)',
          }}
        >
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>
            Tweaks (dev)
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="t-label" style={{ marginBottom: 6 }}>Accent</div>
            <div className="row gap-6 wrap">
              {ACCENT_NAMES.map((a) => (
                <button
                  key={a}
                  onClick={() => pickAccent(a)}
                  className={`chip ${accent === a ? 'chip-active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="t-label" style={{ marginBottom: 6 }}>Theme</div>
            <div className="row gap-6 wrap">
              {(['warm', 'evening'] as ThemeName[]).map((t) => (
                <button
                  key={t}
                  onClick={() => pickTheme(t)}
                  className={`chip ${theme === t ? 'chip-active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="tiny faint">
            Demo accounts: <br />
            demo-fresh / demo-mid / demo-power<br />
            password: <code>demo</code>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-ghost"
        style={{ padding: '8px 12px', fontSize: 11 }}
      >
        {open ? '× close tweaks' : '⚙ tweaks'}
      </button>
    </div>
  );
}
