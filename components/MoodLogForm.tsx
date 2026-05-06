'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { MOOD_FACES, MOOD_LABELS } from '@/components/visual';
import { logMoodAction } from '@/lib/actions/mood';

const TAGS = ['work', 'family', 'sleep', 'social', 'health', 'movement', 'food'];

export function MoodLogForm() {
  const router = useRouter();
  const [mood, setMood] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hoveredMood, setHoveredMood] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function submit() {
    if (mood == null) return;
    setError(null);
    startTransition(async () => {
      try {
        await logMoodAction({ mood, tags, note });
        router.push('/dashboard');
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="t-eyebrow" style={{ marginBottom: 16 }}>
        Right now
      </div>
      <div className="row between" style={{ marginBottom: 18 }}>
        {MOOD_FACES.map((f, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {hoveredMood === i && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 6px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--ink-deep)',
                color: 'var(--paper)',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 10,
              }}>
                {MOOD_LABELS[i]}
              </div>
            )}
            <button
              className={`mood-face ${mood === i + 1 ? 'mood-face-selected' : ''}`}
              onClick={() => setMood(i + 1)}
              onMouseEnter={() => setHoveredMood(i)}
              onMouseLeave={() => setHoveredMood(null)}
              style={{ width: 56, height: 56, fontSize: 26 }}
            >
              {f}
            </button>
          </div>
        ))}
      </div>

      <div className="t-eyebrow" style={{ marginBottom: 10, marginTop: 18 }}>
        Tags{' '}
        <span
          style={{
            textTransform: 'none',
            letterSpacing: 0,
            color: 'var(--ink-faint)',
            fontWeight: 400,
          }}
        >
          · optional
        </span>
      </div>
      <div className="row wrap gap-6" style={{ marginBottom: 20 }}>
        {TAGS.map((t) => {
          const on = tags.includes(t);
          return (
            <button
              key={t}
              type="button"
              className={`chip ${on ? 'chip-active' : ''}`}
              onClick={() => toggleTag(t)}
            >
              {on && <Icon name="check" size={11} />}
              {t}
            </button>
          );
        })}
      </div>

      <textarea
        className="textarea"
        placeholder="A line about it…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={140}
      />

      {error && (
        <div
          className="card"
          style={{
            marginTop: 12,
            padding: 12,
            borderColor: 'var(--accent-deep)',
            color: 'var(--accent-deep)',
          }}
        >
          {error}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ marginTop: 16 }}
        onClick={submit}
        disabled={mood == null || isPending}
      >
        {isPending ? 'Saving…' : 'Save mood'} <Icon name="arrow-right" size={16} />
      </button>
    </div>
  );
}
