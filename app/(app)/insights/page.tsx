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
  const usefulCorr = correlations.filter((c) => c.delta != null);

  return (
    <div className="rise">
      <div className="page-wash">
        <div className="page-wash-inner">
          <div className="page-header">
            <div>
              <div className="notation-tag" style={{ marginBottom: 14 }}>
                INSIGHTS
              </div>
              <h1 className="page-title">Patterns.</h1>
              <p className="page-subtitle">
                What the data shows from your last {stats.daysActive} days.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="page-body-inner">
          {/* 4-stat row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <StatCard label="Best day">
              {bestDay ? (
                <>
                  <div className="stat-num" style={{ fontSize: 26, fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                    {bestDay.label}
                  </div>
                  <div className="tiny muted t-mono" style={{ marginTop: 6 }}>
                    AVG {bestDay.avg.toFixed(1)}
                  </div>
                </>
              ) : (
                <Placeholder text="Need a few check-ins" />
              )}
            </StatCard>

            <StatCard label="Most consistent">
              {mostConsistent && mostConsistent.totalDays > 0 ? (
                <>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--ink-deep)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {mostConsistent.name}
                  </div>
                  <div className="tiny muted t-mono" style={{ marginTop: 6 }}>
                    {Math.round(mostConsistent.rate30d * 100)}% OF DAYS
                  </div>
                </>
              ) : (
                <Placeholder text="No habit data yet" />
              )}
            </StatCard>

            <StatCard label="Reflections">
              <div className="stat-num" style={{ fontSize: 28 }}>
                {reflectionCount}
              </div>
              <div className="tiny muted t-mono" style={{ marginTop: 6 }}>
                WRITTEN
              </div>
            </StatCard>

            <StatCard label="Total XP">
              <div className="stat-num" style={{ fontSize: 28 }}>
                {stats.totalXp}
              </div>
              <div className="tiny muted t-mono" style={{ marginTop: 6 }}>
                L{stats.level}
              </div>
            </StatCard>
          </div>

          {/* Habit completion + correlation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div className="card">
              <div className="row between" style={{ marginBottom: 18 }}>
                <span className="t-eyebrow">Habit completion · last 30d</span>
                <span className="tiny muted t-mono">% OF DAYS</span>
              </div>
              <div className="col gap-16">
                {completion.length === 0 && (
                  <Placeholder text="No habits — add some during onboarding." />
                )}
                {completion.map((h) => {
                  const pct = Math.round(h.rate30d * 100);
                  return (
                    <div key={h.id}>
                      <div className="row between" style={{ marginBottom: 6 }}>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 13,
                            color: 'var(--ink-deep)',
                          }}
                        >
                          {h.name}
                        </span>
                        <span
                          className="t-mono tiny"
                          style={{ fontWeight: 700, color: 'var(--ink-deep)' }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: 6 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            background:
                              pct > 80
                                ? 'var(--good)'
                                : pct > 50
                                ? 'var(--ink-deep)'
                                : 'var(--warn)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card card-warm">
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>
                Correlation
              </div>
              {usefulCorr.length === 0 ? (
                <Placeholder text="Correlations unlock at 14 days of check-ins." />
              ) : (
                <div className="col gap-12">
                  {usefulCorr.slice(0, 3).map((c) => (
                    <p
                      key={c.habitId}
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        margin: 0,
                        color: 'var(--ink)',
                      }}
                    >
                      On{' '}
                      <strong style={{ color: 'var(--accent-deep)', fontWeight: 700 }}>
                        {c.habitName.toLowerCase()}
                      </strong>{' '}
                      days, your average mood is{' '}
                      <strong style={{ color: 'var(--ink-deep)' }}>
                        {c.yesAvgMood?.toFixed(1)}
                      </strong>
                      {c.delta != null && c.delta !== 0 && (
                        <span className="muted tiny">
                          {' '}({c.delta > 0 ? '+' : ''}
                          {c.delta.toFixed(1)} vs other days)
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mood trend */}
          <div className="card">
            <div className="row between" style={{ marginBottom: 18 }}>
              <span className="t-eyebrow">Mood trend · 30 days</span>
              {!enoughTrendData && (
                <span className="tiny muted t-mono">NEED 7+ DAYS</span>
              )}
            </div>
            {enoughTrendData ? (
              <Sparkline values={moodValues} color="rgb(123,97,255)" height={80} fill />
            ) : (
              <Placeholder text="More check-ins needed to draw a trend." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="t-eyebrow" style={{ marginBottom: 12 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="muted tiny" style={{ padding: '8px 0' }}>
      {text}
    </div>
  );
}
