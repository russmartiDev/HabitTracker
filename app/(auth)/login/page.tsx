'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, type LoginState } from '@/lib/actions/login';

export default function LoginPage() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <div className="onboard-card rise">
      <div className="t-eyebrow" style={{ marginBottom: 8 }}>
        Sign in
      </div>
      <h1 className="h-display" style={{ fontSize: 34, margin: 0 }}>
        Welcome back.
      </h1>
      <p className="muted" style={{ marginTop: 10, marginBottom: 28 }}>
        Pick up your streak.
      </p>

      <form action={formAction} className="col gap-16">
        <input type="hidden" name="next" value={next} />
        <label className="col gap-6">
          <span className="t-label">Email</span>
          <input className="input" name="email" type="email" required autoComplete="email" autoFocus />
        </label>

        <label className="col gap-6">
          <span className="t-label">Password</span>
          <input
            className="input"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>

        {state?.error && (
          <div
            className="card"
            style={{ padding: 12, borderColor: 'var(--accent-deep)', color: 'var(--accent-deep)' }}
          >
            {state.error}
          </div>
        )}

        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="row between" style={{ marginTop: 8 }}>
          <span className="tiny muted">No account?</span>
          <Link href="/signup" className="tiny" style={{ color: 'var(--accent-deep)' }}>
            Create one
          </Link>
        </div>

        <p className="tiny faint" style={{ marginTop: 4 }}>
          Password reset is coming soon. Contact the administrator if you&rsquo;re locked out.
        </p>
      </form>
    </div>
  );
}
