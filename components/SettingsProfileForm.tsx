'use client';

import { useActionState } from 'react';
import { updateProfileAction, type ProfileState } from '@/lib/actions/settings';

const TONES = [
  { v: 'encouraging', label: 'Encouraging' },
  { v: 'direct', label: 'Direct' },
  { v: 'playful', label: 'Playful' },
] as const;

export function SettingsProfileForm({
  initialName,
  initialPref,
}: {
  initialName: string;
  initialPref: 'encouraging' | 'direct' | 'playful';
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    null,
  );

  return (
    <form action={formAction} className="col gap-16">
      <div>
        <div className="t-label" style={{ marginBottom: 6 }}>
          Name
        </div>
        <input
          className="input"
          name="name"
          defaultValue={initialName}
          maxLength={60}
          required
          style={{ maxWidth: 320 }}
        />
      </div>

      <div>
        <div className="t-label" style={{ marginBottom: 6 }}>
          Companion tone
        </div>
        <div className="row gap-8 wrap">
          {TONES.map((t) => (
            <label key={t.v} className={`chip`} style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="communication_pref"
                value={t.v}
                defaultChecked={initialPref === t.v}
                style={{ marginRight: 4 }}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {state?.error && (
        <div
          className="card"
          style={{
            padding: 10,
            borderColor: 'var(--accent-deep)',
            color: 'var(--accent-deep)',
            fontSize: 13,
          }}
        >
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="tiny" style={{ color: 'var(--good)' }}>
          Saved.
        </div>
      )}

      <div>
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
