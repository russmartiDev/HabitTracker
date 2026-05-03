'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { MOOD_FACES, MOOD_LABELS } from '@/components/visual';
import { submitCheckInAction } from '@/lib/actions/check-in';
import type { HabitStatus } from '@/lib/types';

const REFLECTION_PROMPTS = [
  'What went well today?',
  "What's one thing you'd do differently tomorrow?",
  'What drained your energy today?',
  'What gave you energy today?',
  "What's one small win from today?",
  'Who or what helped today?',
  'What can wait until tomorrow?',
];

export function CheckInForm({ habits }: { habits: { id: number; name: string }[] }) {
  const habitCount = habits.length;
  const totalSteps = 1 + habitCount + 1; // mood + habits + reflection

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<number | null>(null);
  const [habitAnswers, setHabitAnswers] = useState<Record<number, HabitStatus>>({});
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reflectionPrompt = useMemo(
    () => REFLECTION_PROMPTS[new Date().getDate() % REFLECTION_PROMPTS.length],
    [],
  );

  const isMood = step === 0;
  const isReflection = step === totalSteps - 1;
  const habitIdx = step - 1;
  const currentHabit = !isMood && !isReflection ? habits[habitIdx] : null;

  const canNext = isMood
    ? mood !== null
    : currentHabit
    ? !!habitAnswers[currentHabit.id]
    : true;

  const pct = ((step + 1) / totalSteps) * 100;

  function next() {
    if (step < totalSteps - 1) return setStep(step + 1);
    if (mood == null) return;
    setError(null);
    startTransition(async () => {
      try {
        await submitCheckInAction({
          mood,
          habitAnswers: Object.entries(habitAnswers).map(([habit_id, status]) => ({
            habit_id: Number(habit_id),
            status,
          })),
          reflection,
        });
      } catch (err) {
        const e = err as Error;
        if (e.message === 'NEXT_REDIRECT') return;
        setError(e.message);
      }
    });
  }

  return (
    <div className="onboard-stage">
      <div style={{ width: '100%', maxWidth: 620 }}>
        <div className="row between" style={{ marginBottom: 24 }}>
          <Link href="/dashboard" className="btn btn-ghost">
            <Icon name="x" size={16} /> Close
          </Link>
          <span className="t-eyebrow">
            Step {step + 1} of {totalSteps}
          </span>
        </div>

        <div className="progress" style={{ marginBottom: 36, height: 4 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--ink)' }} />
        </div>

        <div className="onboard-card rise" key={step} style={{ padding: '40px 44px' }}>
          {isMood && <MoodStep mood={mood} setMood={setMood} />}

          {currentHabit && (
            <HabitStep
              name={currentHabit.name}
              idx={habitIdx}
              total={habitCount}
              value={habitAnswers[currentHabit.id]}
              onChange={(s) => setHabitAnswers({ ...habitAnswers, [currentHabit.id]: s })}
            />
          )}

          {isReflection && (
            <ReflectionStep prompt={reflectionPrompt} value={reflection} setValue={setReflection} />
          )}

          {error && (
            <div
              className="card"
              style={{
                marginTop: 16,
                padding: 12,
                borderColor: 'var(--accent-deep)',
                color: 'var(--accent-deep)',
              }}
            >
              {error}
            </div>
          )}

          <div className="row between" style={{ marginTop: 36 }}>
            <button
              className="btn btn-ghost"
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? 'none' : 'auto' }}
            >
              <Icon name="arrow-left" size={16} /> Back
            </button>
            <button className="btn btn-primary" onClick={next} disabled={!canNext || isPending}>
              {isReflection ? (isPending ? 'Submitting…' : 'Submit') : 'Next'}{' '}
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoodStep({ mood, setMood }: { mood: number | null; setMood: (m: number) => void }) {
  return (
    <>
      <div className="t-eyebrow" style={{ marginBottom: 12 }}>
        Mood snapshot
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
        How are you, <span className="h-display" style={{ color: 'var(--accent-deep)' }}>really</span>?
      </h2>
      <p className="muted" style={{ margin: '0 0 28px' }}>
        No wrong answer. Pick the one that feels closest.
      </p>
      <div className="row between" style={{ marginBottom: 22 }}>
        {MOOD_FACES.map((f, i) => (
          <button
            key={i}
            className={`mood-face ${mood === i + 1 ? 'mood-face-selected' : ''}`}
            onClick={() => setMood(i + 1)}
            style={{ width: 64, height: 64, fontSize: 30 }}
          >
            {f}
          </button>
        ))}
      </div>
      <div
        className="row between t-eyebrow"
        style={{ fontSize: 10, color: 'var(--ink-faint)', marginBottom: 22 }}
      >
        {MOOD_LABELS.map((l) => (
          <span key={l} style={{ flex: 1, textAlign: 'center' }}>
            {l}
          </span>
        ))}
      </div>
    </>
  );
}

function HabitStep({
  name,
  idx,
  total,
  value,
  onChange,
}: {
  name: string;
  idx: number;
  total: number;
  value: HabitStatus | undefined;
  onChange: (v: HabitStatus) => void;
}) {
  const options: Array<{ v: HabitStatus; label: string; sub: string }> = [
    { v: 'yes', label: 'Yes', sub: 'Done. ✓' },
    { v: 'partial', label: 'Partly', sub: 'Some of it.' },
    { v: 'no', label: 'Not today', sub: 'No worries.' },
  ];
  return (
    <>
      <div className="t-eyebrow row gap-8" style={{ marginBottom: 12 }}>
        Habit {idx + 1} of {total}
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
        Did you <span className="ink-underline">{name.toLowerCase()}</span> today?
      </h2>
      <p className="muted" style={{ margin: '0 0 28px' }}>
        Even a partial yes counts.
      </p>
      <div className="col gap-8">
        {options.map((o) => {
          const on = value === o.v;
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              style={{
                padding: '16px 18px',
                textAlign: 'left',
                background: on ? 'var(--ink)' : 'var(--paper)',
                color: on ? 'var(--canvas)' : 'var(--ink)',
                border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{o.label}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>{o.sub}</div>
              </div>
              {on && <Icon name="check" size={18} />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function ReflectionStep({
  prompt,
  value,
  setValue,
}: {
  prompt: string;
  value: string;
  setValue: (s: string) => void;
}) {
  return (
    <>
      <div className="t-eyebrow" style={{ marginBottom: 12 }}>
        Reflection
      </div>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
          lineHeight: 1.25,
        }}
      >
        {prompt}
      </h2>
      <p className="muted" style={{ margin: '0 0 24px' }}>
        Optional. A line, a paragraph, anything.
      </p>
      <textarea
        className="textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={500}
        placeholder="Write whatever's there…"
        style={{ minHeight: 140, fontSize: 15, lineHeight: 1.6 }}
        autoFocus
      />
      <div className="row between tiny muted" style={{ marginTop: 8 }}>
        <span className="t-mono">{value.length} / 500</span>
        <span>This stays private to you.</span>
      </div>
    </>
  );
}
