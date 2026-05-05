'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signupAction, type SignupState } from '@/lib/actions/auth';

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signupAction, null);

  return (
    <div className="onboard-card rise">
      <div className="t-eyebrow" style={{ marginBottom: 8 }}>
        Create account
      </div>
      <h1 className="h-display" style={{ fontSize: 34, margin: 0 }}>
        Welcome to <strong>lichen</strong>.
      </h1>
      <p className="muted" style={{ marginTop: 10, marginBottom: 28 }}>
        A warm, daily habit ritual. Five questions to start.
      </p>

      <form action={formAction} className="col gap-16">
        <label className="col gap-6">
          <span className="t-label">What should we call you?</span>
          <input className="input" name="name" type="text" required maxLength={60} autoFocus />
        </label>

        <label className="col gap-6">
          <span className="t-label">Email</span>
          <input className="input" name="email" type="email" required autoComplete="email" />
        </label>

        <label className="col gap-6">
          <span className="t-label">Password</span>
          <input
            className="input"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <span className="tiny faint">8 characters minimum.</span>
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
          {pending ? 'Creating…' : 'Create account'}
        </button>

        <div className="row between" style={{ marginTop: 8 }}>
          <span className="tiny muted">Already have one?</span>
          <Link href="/login" className="tiny" style={{ color: 'var(--accent-deep)' }}>
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
