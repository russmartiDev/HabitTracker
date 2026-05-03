'use client';

import { useState, useTransition } from 'react';
import { resetUserDataAction } from '@/lib/actions/settings';

export function ResetDataButton() {
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="btn btn-ghost"
        style={{ borderColor: 'var(--accent)', color: 'var(--accent-deep)' }}
      >
        Reset my data
      </button>
    );
  }

  return (
    <div className="row gap-8">
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            try {
              await resetUserDataAction();
            } catch (err) {
              if ((err as Error).message !== 'NEXT_REDIRECT') throw err;
            }
          })
        }
        className="btn"
        style={{
          background: 'var(--accent)',
          color: 'var(--paper)',
          borderColor: 'var(--accent-deep)',
        }}
        disabled={isPending}
      >
        {isPending ? 'Resetting…' : 'Yes, wipe everything'}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="btn btn-ghost"
        disabled={isPending}
      >
        Cancel
      </button>
    </div>
  );
}
