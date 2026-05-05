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
  const dateTag = todayDate
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();

  const xpPct =
    stats.xpForNextLevel > 0
      ? Math.round((stats.xpInLevel / stats.xpForNextLevel) * 100)
      : 0;
  const checkedIn = !!today;
  const todayMoodIdx = today ? today.mood - 1 : null;

  const subtitle = checkedIn
    ? "Checked in. Streak's safe."
    : stats.daysActive === 0
    ? 'First day. Start with one small thing.'
    : "Five minutes when you're ready.";

  const aiMessage =
    today?.ai_message ?? defaultGreeting(stats.daysActive, user.name);

  return (
    <div className="rise">
      <div className="page-wash">
        <div className="page-wash-inner">
          <div className="page-header">
            <div>
              <div className="notation-tag" style={{ marginBottom: 14 }}>
                {dateTag}
              </div>
              <h1 className="page-title">
                {timeOfDayGreeting()}, {user.name}.
              </h1>
              <p className="page-subtitle">{subtitle}</p>
            </div>
            <div
              className="col gap-12"
              style={{ alignItems: 'flex-end', flexShrink: 0 }}
            >
              {checkedIn ? (
                <button className="btn btn-secondary" disabled>
                  <Icon name="check" size={14} /> Done today
                </button>
              ) : (
                <Link href="/checkin" className="btn btn-primary btn-lg">
                  Begin check-in <Icon name="arrow-right" size={14} />
                </Link>
              )}
              <Link href="/chat" className="btn btn-ghost btn-sm">
                <Icon name="message" size={14} /> Talk to companion
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="page-body-inner">
          {/* 4-stat metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div className="card">
              <div className="t-eyebrow" style={{ marginBottom: 12 }}>
                Streak
              </div>
              <div className="row gap-12" style={{ alignItems: 'center' }}>
                <FlameStamp size={44} />
                <div>
                  <div className="stat-num" style={{ fontSize: 30 }}>
                    {stats.currentStreak}
                    <span
                      style={{
                        fontSize: 13,
                        color: 'var(--ink-mute)',
                        marginLeft: 4,
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 500,
                      }}
                    >
                      d
                    </span>
                  </div>
                  <div className="tiny muted t-mono" style={{ marginTop: 2 }}>
                    BEST · {stats.longestStreak}d
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="row between" style={{ marginBottom: 12 }}>
                <span className="t-eyebrow">Level</span>
                <span
                  className="chip chip-soft chip-ink"
                  style={{ padding: '2px 8px', fontSize: 10 }}
                >
                  L{stats.level}
                </span>
              </div>
              <div
                className="row between"
                style={{ alignItems: 'baseline', marginBottom: 8 }}
              >
                <div className="stat-num" style={{ fontSize: 30 }}>
                  {stats.xpInLevel}
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 13,
                      color: 'var(--ink-mute)',
                      fontWeight: 400,
                    }}
                  >
                    /{stats.xpForNextLevel}
                  </span>
                </div>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <div className="tiny muted t-mono" style={{ marginTop: 8 }}>
                {stats.xpForNextLevel - stats.xpInLevel} XP TO L{stats.level + 1}
              </div>
            </div>

            <div className="card">
              <div className="row between" style={{ marginBottom: 12 }}>
                <span className="t-eyebrow">Mood today</span>
                <Link
                  href="/mood"
                  className="tiny"
                  style={{ color: 'var(--accent-deep)', fontWeight: 600 }}
                >
                  {today ? 'Update' : 'Log'}
                </Link>
              </div>
              {todayMoodIdx !== null ? (
                <div className="row gap-12" style={{ alignItems: 'center' }}>
                  <div style={{ fontSize: 36 }}>{MOOD_FACES[todayMoodIdx]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink-deep)' }}>
                      {MOOD_LABELS[todayMoodIdx]}
                    </div>
                    <div className="tiny muted t-mono">RIGHT NOW</div>
                  </div>
                </div>
              ) : (
                <div
                  style={{ fontSize: 13, color: 'var(--ink-mute)', padding: '8px 0' }}
                >
                  Not logged yet
                </div>
              )}
            </div>

            <div className="card">
              <div className="t-eyebrow" style={{ marginBottom: 12 }}>
                Mood · 7d
              </div>
              <div
                className="row gap-4 between"
                style={{ alignItems: 'flex-end', height: 44 }}
              >
                {moods.map((m, i) => (
                  <div key={m.date} style={{ flex: 1, textAlign: 'center' }}>
                    <div
                      style={{
                        height: m.mood > 0 ? 6 + m.mood * 8 : 4,
                        background:
                          i === moods.length - 1 && m.mood > 0
                            ? 'var(--ink-deep)'
                            : m.mood > 0
                            ? 'var(--ink-faint)'
                            : 'var(--line)',
                        borderRadius: 2,
                        margin: '0 1px',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="row between" style={{ marginTop: 8 }}>
                {moods.map((m, i) => (
                  <div
                    key={m.date}
                    className="tiny faint t-mono"
                    style={{ flex: 1, textAlign: 'center', fontSize: 9 }}
                  >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(`${m.date}T00:00:00`).getDay()]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI ink card + habits */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              className="card"
              style={{
                background: 'var(--ink-deep)',
                color: 'var(--paper)',
                borderColor: 'var(--ink-deep)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  right: -60,
                  top: -60,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'var(--finesse-yellow)',
                  opacity: 0.18,
                }}
              />
              <div
                className="row between"
                style={{ marginBottom: 16, position: 'relative' }}
              >
                <span
                  className="t-eyebrow"
                  style={{ color: 'var(--finesse-yellow)' }}
                >
                  <Icon name="sparkles" size={11} stroke={2} /> COMPANION NOTE
                </span>
              </div>
              <p
                style={{
                  fontSize: 19,
                  lineHeight: 1.45,
                  margin: '0 0 22px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  letterSpacing: '-0.015em',
                  position: 'relative',
                }}
              >
                &ldquo;{aiMessage}&rdquo;
              </p>
              <div className="row between" style={{ position: 'relative' }}>
                <span
                  className="tiny t-mono"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  — LICHEN AI
                </span>
                <Link
                  href="/chat"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--ink-deep)',
                    background: 'var(--finesse-yellow)',
                    padding: '6px 10px 6px 14px',
                    borderRadius: 999,
                  }}
                >
                  Open chat
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--ink-deep)',
                      color: 'var(--finesse-yellow)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Icon name="arrow-right" size={10} stroke={2.4} />
                  </span>
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>
                Today&rsquo;s habits
              </div>
              <div className="col gap-6">
                {habits.length === 0 && (
                  <div className="muted tiny" style={{ padding: '8px 0' }}>
                    No active habits.
                  </div>
                )}
                {habits.map((h) => (
                  <div
                    key={h.id}
                    className="row between"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--paper-warm)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div className="row gap-10">
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--accent-soft)',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'var(--accent-deep)',
                        }}
                      >
                        <Icon name="leaf" size={13} />
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--ink-deep)',
                        }}
                      >
                        {h.name}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: checkedIn ? 'var(--good)' : 'transparent',
                        border: checkedIn ? 'none' : '1.5px solid var(--line-strong)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'white',
                      }}
                    >
                      {checkedIn && <Icon name="check" size={12} stroke={3} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="card">
            <div className="row between" style={{ marginBottom: 18 }}>
              <div>
                <div className="t-eyebrow">Calendar</div>
                <div className="h-display" style={{ fontSize: 18, marginTop: 4 }}>
                  {monthName} {todayDate.getFullYear()}
                </div>
              </div>
              <div
                className="row gap-12 tiny muted t-mono"
                style={{ fontSize: 10 }}
              >
                <Legend swatch={{ background: 'var(--ink-deep)' }} label="DONE" />
                <Legend
                  swatch={{
                    background: 'var(--paper)',
                    border: '1px solid var(--ink-deep)',
                  }}
                  label="PARTIAL"
                />
                <Legend
                  swatch={{
                    background: 'var(--paper-warm)',
                    border: '1px solid var(--line)',
                  }}
                  label="MISSED"
                />
                <Legend
                  swatch={{ background: 'var(--finesse-yellow)' }}
                  label="TODAY"
                />
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
              {calendar.map((c, i) => {
                const cls =
                  c.status === 'empty'
                    ? 'cal-cell-empty'
                    : c.status === 'today'
                    ? 'cal-cell-today'
                    : c.status === 'done'
                    ? 'cal-cell-done'
                    : c.status === 'partial'
                    ? 'cal-cell-partial'
                    : c.status === 'miss'
                    ? 'cal-cell-missed'
                    : '';
                return (
                  <div key={i} className={`cal-cell ${cls}`}>
                    {c.day || ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({
  swatch,
  label,
}: {
  swatch: React.CSSProperties;
  label: string;
}) {
  return (
    <span className="row gap-6">
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          display: 'inline-block',
          ...swatch,
        }}
      />
      {label}
    </span>
  );
}

function defaultGreeting(daysActive: number, name: string): string {
  if (daysActive === 0)
    return `Welcome in, ${name}. Whenever you're ready, take five minutes.`;
  if (daysActive < 7) return 'Early days. The shape of a practice is just a few minutes a day.';
  return 'You keep showing up. That is the entire game.';
}
