'use client';

import { useState, useTransition } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { HABIT_TEMPLATES } from '@/components/visual';
import { submitOnboardingAction, type OnboardingPayload } from '@/lib/actions/onboarding';
import type { ActiveTime, CommunicationPref, Goal } from '@/lib/types';

const GOALS: { v: Goal; label: string; icon: IconName }[] = [
  { v: 'health', label: 'Health', icon: 'heart' },
  { v: 'productivity', label: 'Productivity', icon: 'target' },
  { v: 'mental_wellness', label: 'Mental Wellness', icon: 'leaf' },
  { v: 'learning', label: 'Learning', icon: 'book' },
  { v: 'relationships', label: 'Relationships', icon: 'sparkles' },
];

const TIMES: { v: ActiveTime; label: string; icon: IconName }[] = [
  { v: 'morning', label: 'Morning', icon: 'sun' },
  { v: 'afternoon', label: 'Afternoon', icon: 'sun' },
  { v: 'evening', label: 'Evening', icon: 'moon' },
  { v: 'night', label: 'Night', icon: 'moon' },
];

const TONES: { v: CommunicationPref; label: string; sub: string }[] = [
  { v: 'encouraging', label: 'Encouraging', sub: 'Warm. Cheering you on.' },
  { v: 'direct', label: 'Direct', sub: 'Honest. To the point.' },
  { v: 'playful', label: 'Playful', sub: 'Witty. A little teasing.' },
];

export function OnboardingFlow({ userName }: { userName: string }) {
  const [phase, setPhase] = useState<'intro' | 'q'>('intro');
  const [step, setStep] = useState(0); // intro slide 0..2

  const [q, setQ] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [active, setActive] = useState<ActiveTime | null>(null);
  const [habits, setHabits] = useState<string[]>([]);
  const [customHabit, setCustomHabit] = useState('');
  const [tone, setTone] = useState<CommunicationPref | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const introSlides = [
    {
      eyebrow: 'Welcome',
      title: 'A quiet place to check in with yourself.',
      body:
        "No streaks-as-pressure. No notifications shouting. Just five minutes a day to notice what's actually happening.",
    },
    {
      eyebrow: 'How it works',
      title: 'Five small questions, once a day.',
      body:
        'Mood, a couple of habits, and a single reflection. Some days an algorithm grades it. Some days an AI companion writes back.',
    },
    {
      eyebrow: `Hi, ${userName}`,
      title: 'A few quick things about you.',
      body: "We'll use these to shape the daily questions. You can change any of it later.",
    },
  ];

  const canNext = [!!goal, !!active, habits.length > 0, !!tone][q];

  function toggleHabit(name: string) {
    setHabits((h) => (h.includes(name) ? h.filter((x) => x !== name) : [...h, name]));
  }

  function addCustomHabit() {
    const name = customHabit.trim();
    if (!name || habits.includes(name)) return;
    setHabits((h) => [...h, name]);
    setCustomHabit('');
  }

  function next() {
    if (q < 3) return setQ(q + 1);
    if (!goal || !active || !tone || habits.length === 0) return;

    const payload: OnboardingPayload = {
      goal,
      active_time: active,
      habits,
      communication_pref: tone,
    };
    setError(null);
    startTransition(async () => {
      try {
        await submitOnboardingAction(payload);
      } catch (err) {
        const e = err as Error;
        if (e.message === 'NEXT_REDIRECT') return; // expected
        setError(e.message);
      }
    });
  }

  if (phase === 'intro') {
    const s = introSlides[step];
    return (
      <div className="onboard-card rise" key={step}>
        <div className="t-eyebrow" style={{ marginBottom: 18 }}>
          {s.eyebrow}
        </div>
        <h1
          style={{
            fontSize: 34,
            lineHeight: 1.15,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '0 0 18px',
          }}
        >
          {s.title}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.55, margin: '0 0 36px' }}>
          {s.body}
        </p>
        <div className="row between">
          <div className="dot-row">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`dot ${i === step ? 'dot-active' : ''}`} />
            ))}
          </div>
          <div className="row gap-8">
            {step === 0 && (
              <button className="btn btn-ghost" onClick={() => setPhase('q')}>
                Skip intro
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => (step < 2 ? setStep(step + 1) : setPhase('q'))}
            >
              {step < 2 ? 'Continue' : "Let's begin"} <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboard-card rise" key={q} style={{ maxWidth: 580 }}>
      <div className="row between" style={{ marginBottom: 24 }}>
        <span className="t-eyebrow">
          Question {q + 1} of 4
        </span>
        <div className="dot-row">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`dot ${i === q ? 'dot-active' : ''}`}
              style={{ background: i <= q ? 'var(--ink)' : 'var(--line)' }}
            />
          ))}
        </div>
      </div>

      {q === 0 && (
        <>
          <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            What&rsquo;s your main goal right now?
          </h2>
          <p className="muted" style={{ margin: '0 0 20px' }}>
            Pick the one that fits today. You can always shift later.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {GOALS.map((g) => (
              <PickButton
                key={g.v}
                active={goal === g.v}
                onClick={() => setGoal(g.v)}
                icon={g.icon}
                label={g.label}
              />
            ))}
          </div>
        </>
      )}

      {q === 1 && (
        <>
          <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            When are you most yourself?
          </h2>
          <p className="muted" style={{ margin: '0 0 20px' }}>
            We&rsquo;ll time check-in nudges around it.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TIMES.map((t) => (
              <PickButton
                key={t.v}
                active={active === t.v}
                onClick={() => setActive(t.v)}
                icon={t.icon}
                label={t.label}
              />
            ))}
          </div>
        </>
      )}

      {q === 2 && (
        <>
          <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            What habits are you nudging at?
          </h2>
          <p className="muted" style={{ margin: '0 0 20px' }}>
            Pick 1–4 to start. We can always trim or add.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {HABIT_TEMPLATES.map((h) => {
              const on = habits.includes(h.name);
              return (
                <button
                  key={h.id}
                  className="chip"
                  onClick={() => toggleHabit(h.name)}
                  style={{
                    padding: '8px 14px',
                    background: on ? 'var(--ink)' : 'var(--paper)',
                    color: on ? 'var(--canvas)' : 'var(--ink-soft)',
                    borderColor: on ? 'var(--ink)' : 'var(--line)',
                  }}
                >
                  <Icon name={h.icon as IconName} size={14} />
                  {h.name}
                </button>
              );
            })}
          </div>
          <div className="row gap-8" style={{ marginBottom: 8 }}>
            <input
              className="input"
              placeholder="Custom habit…"
              value={customHabit}
              maxLength={60}
              onChange={(e) => setCustomHabit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomHabit();
                }
              }}
            />
            <button type="button" className="btn btn-ghost" onClick={addCustomHabit}>
              <Icon name="plus" size={14} /> Add
            </button>
          </div>
          <div className="tiny muted">{habits.length} selected</div>
        </>
      )}

      {q === 3 && (
        <>
          <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            How should we talk to you?
          </h2>
          <p className="muted" style={{ margin: '0 0 20px' }}>
            This shapes the AI companion&rsquo;s voice.
          </p>
          <div className="col gap-8">
            {TONES.map((t) => (
              <button
                key={t.v}
                onClick={() => setTone(t.v)}
                style={{
                  padding: '16px 18px',
                  textAlign: 'left',
                  background: tone === t.v ? 'var(--ink)' : 'var(--paper)',
                  color: tone === t.v ? 'var(--canvas)' : 'var(--ink)',
                  border: `1px solid ${tone === t.v ? 'var(--ink)' : 'var(--line)'}`,
                  borderRadius: 'var(--radius)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>{t.sub}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <div
          className="card"
          style={{ marginTop: 16, padding: 12, borderColor: 'var(--accent-deep)', color: 'var(--accent-deep)' }}
        >
          {error}
        </div>
      )}

      <div className="row between" style={{ marginTop: 32 }}>
        <button
          className="btn btn-ghost"
          onClick={() => setQ(Math.max(0, q - 1))}
          disabled={q === 0}
          style={{ opacity: q === 0 ? 0 : 1, pointerEvents: q === 0 ? 'none' : 'auto' }}
        >
          <Icon name="arrow-left" size={16} /> Back
        </button>
        <button className="btn btn-primary" onClick={next} disabled={!canNext || isPending}>
          {q < 3 ? 'Continue' : isPending ? 'Saving…' : 'Finish setup'}{' '}
          <Icon name="arrow-right" size={16} />
        </button>
      </div>
    </div>
  );
}

function PickButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: IconName;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 18px',
        textAlign: 'left',
        background: active ? 'var(--ink)' : 'var(--paper)',
        color: active ? 'var(--canvas)' : 'var(--ink)',
        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontWeight: 500,
        fontSize: 15,
      }}
    >
      <Icon name={icon} size={18} />
      {label}
    </button>
  );
}
