'use client';

import { useOptimistic, useTransition, useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { updateToneAction } from '@/lib/actions/settings';
import type { CommunicationPref } from '@/lib/types';

const TONES: { v: CommunicationPref; label: string; desc: string }[] = [
  { v: 'encouraging', label: 'Encouraging', desc: 'Warm. Cheering you on.' },
  { v: 'direct', label: 'Direct', desc: 'Honest. To the point.' },
  { v: 'playful', label: 'Playful', desc: 'Witty. A little teasing.' },
];

export function TonePicker({ currentPref }: { currentPref: CommunicationPref }) {
  const [optimisticPref, setOptimisticPref] = useOptimistic(currentPref);
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function handleSelect(pref: CommunicationPref) {
    setOpen(false);
    if (pref === optimisticPref) return;
    startTransition(async () => {
      setOptimisticPref(pref);
      await updateToneAction(pref);
    });
  }

  const current = TONES.find((t) => t.v === optimisticPref)!;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          border: 'none',
          background: 'transparent',
          font: 'inherit',
          fontSize: 'inherit',
          color: 'var(--ink-deep)',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {current.label}
        <Icon name="chevron-down" size={14} stroke={2} />
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 190,
            padding: 6,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {TONES.map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => handleSelect(t.v)}
              style={{
                border: 'none',
                background: optimisticPref === t.v ? 'var(--accent-soft)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                padding: '8px 12px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink-deep)' }}>
                {t.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--ink-mid)' }}>
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
