import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { localDateString, shiftDate } from '@/lib/dates';
import { MoodLogForm } from '@/components/MoodLogForm';

export default async function MoodPage() {
  const user = await requireUser();
  const db = getDb();

  // 30-day mood map — daily average from mood_logs (or check-in mood as fallback)
  const today = localDateString();
  const start = shiftDate(today, -29);

  const mlRows = db
    .prepare(
      `SELECT date(logged_at/1000, 'unixepoch', 'localtime') AS d, AVG(mood) AS m
       FROM mood_logs
       WHERE user_id = ? AND logged_at >= ?
       GROUP BY d`,
    )
    .all(
      user.id,
      new Date(`${start}T00:00:00`).getTime(),
    ) as Array<{ d: string; m: number }>;

  const ciRows = db
    .prepare(
      `SELECT date AS d, mood AS m FROM check_ins WHERE user_id = ? AND date >= ?`,
    )
    .all(user.id, start) as Array<{ d: string; m: number }>;

  const map = new Map<string, number>();
  for (const r of ciRows) map.set(r.d, r.m);
  for (const r of mlRows) map.set(r.d, r.m); // mood_logs override check-in mood when present

  const cells: { date: string; mood: number | null }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = shiftDate(today, -i);
    cells.push({ date: d, mood: map.get(d) ?? null });
  }
  const moodValues = cells.map((c) => c.mood).filter((v): v is number => v !== null);
  const avg = moodValues.length
    ? (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1)
    : '—';

  return (
    <div className="rise">
      <div className="page-header">
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>
            Mood Log
          </div>
          <h1 className="page-title">
            How are you,{' '}
            <span className="h-display" style={{ color: 'var(--accent-deep)' }}>
              now
            </span>
            ?
          </h1>
          <p className="page-subtitle">
            Log up to 5 times a day. The patterns matter more than any single one.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <MoodLogForm />

        <div className="card">
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>
            30-day mood map
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 4,
              marginBottom: 18,
            }}
          >
            {cells.map((c) => (
              <div
                key={c.date}
                title={`${c.date}${c.mood ? ' — ' + c.mood.toFixed(1) : ''}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 5,
                  background:
                    c.mood == null
                      ? 'var(--miss)'
                      : c.mood < 1.5
                      ? 'oklch(0.78 0.07 30)'
                      : c.mood < 2.5
                      ? 'oklch(0.84 0.06 50)'
                      : c.mood < 3.5
                      ? 'oklch(0.88 0.05 80)'
                      : c.mood < 4.5
                      ? 'oklch(0.85 0.07 130)'
                      : 'oklch(0.78 0.10 145)',
                  opacity: c.mood == null ? 0.4 : 1,
                }}
              />
            ))}
          </div>
          <div className="row between tiny muted" style={{ marginBottom: 22 }}>
            <span>30d ago</span>
            <span>today</span>
          </div>

          <div className="t-eyebrow" style={{ marginBottom: 8 }}>
            Average mood
          </div>
          <div className="row gap-12" style={{ alignItems: 'baseline' }}>
            <div className="stat-num stat-num-sm">{avg}</div>
            <div className="tiny muted">
              {moodValues.length} day{moodValues.length === 1 ? '' : 's'} logged
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
