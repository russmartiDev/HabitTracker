import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getUserStats } from '@/lib/stats';
import {
  getBestDayOfWeek,
  getHabitCompletion,
  getMoodHabitCorrelations,
  getMoodTrend30,
  getReflectionsCount,
} from '@/lib/insights';
import { Sparkline } from '@/components/visual';

export default async function InsightsPage() {
  const user = await requireUser();
  const stats = getUserStats(user.id);
  const completion = getHabitCompletion(user.id);
  const moodTrend = getMoodTrend30(user.id);
  const bestDay = getBestDayOfWeek(user.id);
  const correlations = getMoodHabitCorrelations(user.id);
  const reflectionCount = getReflectionsCount(user.id);

  const moodValues = moodTrend.map((p) => p.mood).filter((v): v is number => v != null);
  const enoughTrendData = moodValues.length >= 7;
  const mostConsistent =
    completion.length > 0
      ? completion.reduce((a, b) => (a.rate30d > b.rate30d ? a : b))
      : null;

  return (
    <div className="rise">
      <div className="page-header">
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>
            Insights
          </div>
          <h1 className="page-title">
            What the <span className="ink-underline">data</span> is whispering.
          </h1>
          <p className="page-subtitle">
            Patterns from your last {stats.daysActive} days.
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <StatCard label="Best day">
          {bestDay ? (
            <>
              <div className="stat-num stat-num-sm">{bestDay.label}</div>
              <div className="tiny muted" style={{ marginTop: 4 }}>
                avg mood {bestDay.avg.toFixed(1)}
              </div>
            </>
          ) : (
            <Placeholder text="Need a few check-ins" />
          )}
        </StatCard>
        <StatCard label="Most consistent">
          {mostConsistent && mostConsistent.totalDays > 0 ? (
            <>
              <div className="stat-num stat-num-sm" style={{ fontSize: 22 }}>
                {mostConsistent.name}
              </div>
              <div className="tiny muted" style={{ marginTop: 4 }}>
                {Math.round(mostConsistent.rate30d * 100)}% of days
              </div>
            </>
          ) : (
            <Placeholder text="No habit data yet" />
          )}
        </StatCard>
        <StatCard label="Reflections">
          <div className="stat-num stat-num-sm">{reflectionCount}</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>
            written
          </div>
        </StatCard>
        <StatCard label="Total XP">
          <div className="stat-num stat-num-sm t-mono">{stats.totalXp}</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>
            L{stats.level}
          </div>
        </StatCard>
      </div>

      {/* Habit completion + correlations */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}
      >
        <div className="card">
          <div className="row between" style={{ marginBottom: 18 }}>
            <span className="t-eyebrow">Habit completion</span>
            <span className="tiny muted">last 7 / last 30 days</span>
          </div>
          <div className="col gap-16">
            {completion.length === 0 && <Placeholder text="No habits — add some in onboarding or settings" />}
            {completion.map((h) => (
              <div key={h.id}>
                <div className="row between" style={{ marginBottom: 6 }}>
                  <div className="row gap-8" style={{ alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{h.name}</span>
                  </div>
                  <span className="t-mono tiny" style={{ fontWeight: 500 }}>
                    {Math.round(h.rate7d * 100)}% · {Math.round(h.rate30d * 100)}%
                  </span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.round(h.rate30d * 100)}%`,
                      background:
                        h.rate30d > 0.8
                          ? 'var(--good)'
                          : h.rate30d > 0.5
                          ? 'var(--accent)'
                          : 'var(--ochre)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-warm">
          <div className="t-eyebrow" style={{ marginBottom: 14 }}>
            Mood × habit
          </div>
          {correlations.length === 0 ? (
            <Placeholder text="Correlations unlock at 14 days of check-ins." />
          ) : (
            <div className="col gap-12">
              {correlations
                .filter((c) => c.delta != null)
                .slice(0, 3)
                .map((c) => (
                  <p
                    key={c.habitId}
                    className="h-display"
                    style={{
                      fontSize: 16,
                      lineHeight: 1.5,
                      margin: 0,
                      color: 'var(--ink)',
                    }}
                  >
                    On{' '}
                    <strong style={{ color: 'var(--accent-deep)' }}>
                      {c.habitName.toLowerCase()}
                    </strong>{' '}
                    days, your average mood is <strong>{c.yesAvgMood?.toFixed(1)}</strong>{' '}
                    {c.delta != null && c.delta !== 0 && (
                      <span className="muted tiny">
                        ({c.delta > 0 ? '+' : ''}
                        {c.delta.toFixed(1)} vs other days)
                      </span>
                    )}
                  </p>
                ))}
              {correlations.every((c) => c.delta == null) && (
                <Placeholder text="Need both completed and missed days for a habit." />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mood trend */}
      <div className="card">
        <div className="row between" style={{ marginBottom: 18 }}>
          <span className="t-eyebrow">Mood trend · 30 days</span>
          {!enoughTrendData && <span className="tiny muted">Need 7+ days</span>}
        </div>
        {enoughTrendData ? (
          <Sparkline values={moodValues} color="var(--accent)" height={80} fill />
        ) : (
          <Placeholder text="Need more check-ins to draw a trend." />
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href="/badges" className="btn btn-ghost">
          See badges →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="t-eyebrow" style={{ marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="muted tiny" style={{ padding: '12px 0' }}>
      {text}
    </div>
  );
}
