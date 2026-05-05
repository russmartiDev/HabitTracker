'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { applyTheme, readTheme, type ThemeName } from './ThemeApplier';

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeName>('warm');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function pickTheme(t: ThemeName) {
    setTheme(t);
    localStorage.setItem('lichen.theme', t);
    applyTheme(t);
  }

  async function impersonate(email: string) {
    // Use the credentials sign-in flow with redirect to repaint cleanly.
    startTransition(async () => {
      // Sign out current session, then re-sign in with the demo cred.
      await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {});
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();
      const body = new URLSearchParams({
        csrfToken,
        email,
        password: 'demo',
        callbackUrl: '/dashboard',
      });
      await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        redirect: 'manual',
      });
      router.push('/dashboard');
      router.refresh();
    });
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
            width: 260,
            borderColor: 'var(--ink-soft)',
          }}
        >
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>
            Tweaks (dev)
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="t-label" style={{ marginBottom: 6 }}>
              Theme
            </div>
            <div className="row gap-6 wrap">
              {(['warm', 'evening'] as ThemeName[]).map((t) => (
                <button
                  key={t}
                  onClick={() => pickTheme(t)}
                  className={`chip ${theme === t ? 'chip-active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t === 'warm' ? 'Warm' : 'Evening'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="t-label" style={{ marginBottom: 6 }}>
              Demo user
            </div>
            <div className="col gap-6">
              {[
                { email: 'demo-fresh@lichen.local', label: 'Day 1 (fresh)' },
                { email: 'demo-mid@lichen.local', label: 'Day 12 (mid)' },
                { email: 'demo-power@lichen.local', label: 'Day 60 (power)' },
              ].map((u) => (
                <button
                  key={u.email}
                  onClick={() => impersonate(u.email)}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: 11 }}
                  disabled={isPending}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="t-label" style={{ marginBottom: 6 }}>
              Jump
            </div>
            <div className="col gap-6">
              <button
                onClick={() => router.push('/checkin')}
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: 11 }}
              >
                Begin check-in
              </button>
              <button
                onClick={() => router.push('/onboarding')}
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: 11 }}
              >
                Re-run onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary btn-sm"
        style={{ fontSize: 11 }}
      >
        {open ? '× close' : '⚙ tweaks'}
      </button>
    </div>
  );
}
