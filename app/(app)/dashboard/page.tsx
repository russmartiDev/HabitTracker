import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import {
  getMonthCalendar,
  getRecentMoods,
  getTodayCheckIn,
  getUserStats,
} from '@/lib/stats';
import { getActiveHabits } from '@/lib/habits';
import { timeOfDayGreeting } from '@/lib/dates';
import { Icon } from '@/components/Icon';
import { FlameStamp } from '@/components/visual';
import { MOOD_FACES, MOOD_LABELS } from '@/components/visual';

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user.onboarding_completed) redirect('/onboarding');

  const stats = getUserStats(user.id);
  const today = getTodayCheckIn(user.id);
  const moods = getRecentMoods(user.id, 7);
  const habits = getActiveHabits(user.id).slice(0, 5);

  const todayDate = new Date();
  const calendar = getMonthCalendar(user.id, todayDate.getFullYear(), todayDate.getMonth());
  const monthName = todayDate.toLocaleString('en-US', { month: 'long' });
  const dayHeader = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const xpPct =
    stats.xpForNextLevel > 0
      ? Math.round((stats.xpInLevel / stats.xpForNextLevel) * 100)
      : 0;
  const checkedIn = !!today;
  const todayMoodIdx = today ? today.mood - 1 : null;

  // Day 1 / no-history: collapse to a single invitation card. The metrics
  // grid only earns its space once there's data to show.
  if (stats.daysActive === 0 && !checkedIn) {
    return (
      <div className="rise" style={{ maxWidth: 540, margin: '0 auto', paddingTop: 48 }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>
          {dayHeader}
        </div>
        <h1
          className="page-title"
          style={{ fontSize: 36, margin: '0 0 14px' }}
        >
          {timeOfDayGreeting()},{' '}
          <span className="h-display" style={{ color: 'var(--accent-deep)' }}>
            {user.name}
          </span>
          .
        </h1>
        <p className="lede" style={{ marginBottom: 32 }}>
          First day in. Take five minutes when you&rsquo;re ready — one mood, your
          habits, a single line of reflection.
        </p>
        <Link href="/checkin" className="btn btn-primary btn-lg btn-block">
          Begin first check-in <Icon name="arrow-right" size={16} />
        </Link>
        <p className="tiny faint" style={{ marginTop: 20, textAlign: 'center' }}>
          Streak, XP, calendar, and patterns appear as you build a record.
        </p>
      </div>
    );
  }

  return (
    <div className="rise">
      <div className="row between" style={{ marginBottom: 22, alignItems: 'flex-end' }}>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 6 }}>
            {dayHeader}
          </div>
          <h1
            className="page-title"
            style={{ fontSize: 32, margin: 0 }}
          >
            {timeOfDayGreeting()},{' '}
            <span className="h-display" style={{ color: 'var(--accent-deep)' }}>
              {user.name}
            </span>
            .
          </h1>
        </div>
        <div className="row gap-8">
          <Link href="/chat" className="btn btn-ghost">
            <Icon name="message" size={16} /> Chat
          </Link>
          {checkedIn ? (
            <button className="btn btn-ghost" disabled>
              <Icon name="check" size={16} /> Checked in today
            </button>
          ) : (
            <Link href="/checkin" className="btn btn-primary btn-lg">
              Begin check-in <Icon name="arrow-right" size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* TOP ROW: streak | xp | mood */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1.1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div className="card">
          <div className="row between" style={{ marginBottom: 12 }}>
            <span className="t-eyebrow">Current streak</span>
            <span className="tiny muted">Longest · {stats.longestStreak}d</span>
          </div>
          <div className="row gap-16" style={{ alignItems: 'flex-end' }}>
            <div className="flicker">
              <FlameStamp size={64} />
            </div>
            <div>
              <div className="stat-num">
                {stats.currentStreak}
                <span style={{ fontSize: 20, color: 'var(--ink-mute)', marginLeft: 4 }}>days</span>
              </div>
              <div className="tiny muted" style={{ marginTop: 2 }}>
                {stats.currentStreak === 0
                  ? 'Start one today'
                  : stats.currentStreak < 7
                  ? 'Keep the kindling going'
                  : stats.currentStreak < 21
                  ? 'Real momentum now'
                  : 'A practice, honestly.'}
              </div>
            </div>
          </div>
        </div>

        <div className="card card-warm">
          <div className="row between" style={{ marginBottom: 12 }}>
            <span className="t-eyebrow">Level {stats.level}</span>
            <span className="tiny muted t-mono">{stats.totalXp} XP total</span>
          </div>
          <div className="row between" style={{ alignItems: 'baseline', marginBottom: 10 }}>
            <div>
              <span className="stat-num stat-num-sm">{stats.xpInLevel}</span>
              <span className="t-mono muted" style={{ fontSize: 14, marginLeft: 6 }}>
                / {stats.xpForNextLevel}
              </span>
            </div>
            <div className="tiny muted">
              {stats.xpForNextLevel - stats.xpInLevel} to L{stats.level + 1}
            </div>
          </div>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="tiny muted" style={{ marginTop: 10 }}>
            +10 daily · +5 all habits · +3 reflection · +2 mood
          </div>
        </div>

        <div className="card">
          <div className="row between" style={{ marginBottom: 12 }}>
            <span className="t-eyebrow">Mood · 7 days</span>
            <Link
              href="/mood"
              className="tiny"
              style={{ color: 'var(--accent-deep)', cursor: 'pointer' }}
            >
              {today ? 'Update' : 'Log today'}
            </Link>
          </div>
          <div className="row gap-8" style={{ marginBottom: 12 }}>
            {todayMoodIdx !== null ? (
              <>
                <div style={{ fontSize: 32 }}>{MOOD_FACES[todayMoodIdx]}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{MOOD_LABELS[todayMoodIdx]}</div>
                  <div className="tiny muted">today</div>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Not logged yet today</div>
            )}
          </div>
          <div className="row gap-4 between" style={{ alignItems: 'flex-end' }}>
            {moods.map((m, i) => (
              <div key={m.date} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    height: 8 + m.mood * 6,
                    background:
                      i === moods.length - 1 && m.mood > 0
                        ? 'var(--accent)'
                        : m.mood === 0
                        ? 'var(--line)'
                        : 'var(--ink-faint)',
                    borderRadius: 3,
                    marginBottom: 4,
                  }}
                />
                <div className="tiny faint t-mono" style={{ fontSize: 9 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(`${m.date}T00:00:00`).getDay()]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: AI suggestion + habits */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}
      >
        <div
          className="card"
          style={{
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-soft)',
            position: 'relative',
          }}
        >
          <div className="row between" style={{ marginBottom: 14 }}>
            <span className="t-eyebrow row gap-6">
              <Icon name="sparkles" size={12} /> A note for you
            </span>
          </div>
          <p
            className="h-display"
            style={{
              fontSize: 22,
              lineHeight: 1.45,
              margin: '0 0 18px',
              color: 'var(--ink)',
              maxWidth: 560,
            }}
          >
            &ldquo;{today?.ai_message ?? defaultGreeting(stats.daysActive, user.name)}&rdquo;
          </p>
          <div className="row between">
            <span className="tiny muted">— your companion</span>
            <Link href="/chat" className="tiny" style={{ color: 'var(--accent-deep)' }}>
              Open chat →
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="t-eyebrow" style={{ marginBottom: 14 }}>
            Habits in play
          </div>
          <div className="col gap-8">
            {habits.length === 0 && (
              <div className="muted tiny">No active habits — add some in settings.</div>
            )}
            {habits.map((h, i) => (
              <div
                key={h.id}
                className="row between"
                style={{
                  padding: '10px 12px',
                  borderRadius: 9,
                  background: i % 2 === 0 ? 'var(--paper-warm)' : 'transparent',
                }}
              >
                <div className="row gap-12">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: 'var(--canvas)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--accent-deep)',
                    }}
                  >
                    <Icon name="leaf" size={14} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{h.name}</div>
                </div>
                <div className="t-mono tiny muted">{checkedIn ? '✓' : '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="card">
        <div className="row between" style={{ marginBottom: 18 }}>
          <div>
            <div className="t-eyebrow">Calendar</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
              {monthName} {todayDate.getFullYear()}
            </div>
          </div>
          <div className="row gap-12 tiny muted">
            <Legend color="var(--sage-soft)" label="Done" />
            <Legend color="var(--ochre-soft)" label="Partial" />
            <Legend color="var(--miss)" label="Missed" />
            <Legend color="var(--accent)" label="Today" />
          </div>
        </div>
        <div className="cal-grid" style={{ marginBottom: 6 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div
              key={i}
              className="t-eyebrow"
              style={{ textAlign: 'center', fontSize: 10, padding: '4px 0' }}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="cal-grid">
          {calendar.map((c, i) => (
            <div
              key={i}
              className={`cal-cell ${c.status === 'empty' ? 'cal-cell-empty' : `cal-cell-${c.status}`}`}
            >
              {c.day || ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="row gap-6">
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: color,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
}

function defaultGreeting(daysActive: number, name: string): string {
  if (daysActive === 0) return `Welcome in, ${name}. Whenever you're ready, take five minutes.`;
  if (daysActive < 7) return 'Early days. The shape of a practice is just a few minutes a day.';
  return 'You keep showing up. That is the entire game.';
}

