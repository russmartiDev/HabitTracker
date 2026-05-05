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
      <div className="page-wash">
        <div className="page-wash-inner">
          <div className="page-header">
            <div>
              <div className="notation-tag" style={{ marginBottom: 14 }}>
                MOOD LOG
              </div>
              <h1 className="page-title">How are you, now?</h1>
              <p className="page-subtitle">
                {moodValues.length > 0
                  ? `${avg} average across ${moodValues.length} day${moodValues.length === 1 ? '' : 's'} logged.`
                  : 'Up to five times a day. The patterns matter more than any single one.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="page-body-inner">
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
                      ? 'var(--paper-warm)'
                      : c.mood < 1.5
                      ? 'var(--error-soft)'
                      : c.mood < 2.5
                      ? 'var(--warn-soft)'
                      : c.mood < 3.5
                      ? 'var(--accent-soft)'
                      : c.mood < 4.5
                      ? 'var(--info-soft)'
                      : 'var(--good-soft)',
                  border: c.mood == null ? '1px solid var(--line)' : 'none',
                  opacity: c.mood == null ? 0.4 : 1,
                }}
              />
            ))}
          </div>
          <div className="row between tiny muted t-mono" style={{ marginBottom: 22, fontSize: 10 }}>
            <span>30D AGO</span>
            <span>TODAY</span>
          </div>

          <div className="t-eyebrow" style={{ marginBottom: 8 }}>
            Average mood
          </div>
          <div className="row gap-12" style={{ alignItems: 'baseline' }}>
            <div className="stat-num stat-num-sm">{avg}</div>
            <div className="tiny muted t-mono">
              {moodValues.length} DAY{moodValues.length === 1 ? '' : 'S'} LOGGED
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
