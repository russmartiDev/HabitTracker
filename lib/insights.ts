// Aggregations for the /insights page.
import { getDb } from '@/lib/db';
import { localDateString, shiftDate } from '@/lib/dates';

export interface HabitCompletion {
  id: number;
  name: string;
  rate7d: number; // 0..1
  rate30d: number; // 0..1
  totalDays: number; // count of days the habit existed in the 30-day window
  yes30d: number;
}

export function getHabitCompletion(userId: number): HabitCompletion[] {
  const db = getDb();
  const today = localDateString();
  const start7 = shiftDate(today, -6);
  const start30 = shiftDate(today, -29);

  const habits = db
    .prepare(
      `SELECT id, name FROM habits WHERE user_id = ? AND archived = 0 ORDER BY created_at ASC`,
    )
    .all(userId) as Array<{ id: number; name: string }>;

  const stmt = db.prepare(
    `SELECT
       SUM(CASE WHEN ci.date >= ? AND hl.status = 'yes' THEN 1 ELSE 0 END) AS yes7,
       SUM(CASE WHEN ci.date >= ? THEN 1 ELSE 0 END) AS total7,
       SUM(CASE WHEN ci.date >= ? AND hl.status = 'yes' THEN 1 ELSE 0 END) AS yes30,
       SUM(CASE WHEN ci.date >= ? THEN 1 ELSE 0 END) AS total30
     FROM habit_logs hl
     JOIN check_ins ci ON ci.id = hl.check_in_id
     WHERE ci.user_id = ? AND hl.habit_id = ?`,
  );

  return habits.map((h) => {
    const r = stmt.get(start7, start7, start30, start30, userId, h.id) as {
      yes7: number | null;
      total7: number | null;
      yes30: number | null;
      total30: number | null;
    };
    const yes7 = r.yes7 ?? 0;
    const total7 = r.total7 ?? 0;
    const yes30 = r.yes30 ?? 0;
    const total30 = r.total30 ?? 0;
    return {
      id: h.id,
      name: h.name,
      rate7d: total7 ? yes7 / total7 : 0,
      rate30d: total30 ? yes30 / total30 : 0,
      totalDays: total30,
      yes30d: yes30,
    };
  });
}

export interface MoodTrendPoint {
  date: string;
  mood: number | null;
}

export function getMoodTrend30(userId: number): MoodTrendPoint[] {
  const db = getDb();
  const today = localDateString();
  const start = shiftDate(today, -29);
  const rows = db
    .prepare(
      `SELECT date, mood FROM check_ins WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC`,
    )
    .all(userId, start, today) as Array<{ date: string; mood: number }>;
  const map = new Map(rows.map((r) => [r.date, r.mood]));
  const out: MoodTrendPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = shiftDate(today, -i);
    out.push({ date: d, mood: map.get(d) ?? null });
  }
  return out;
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getBestDayOfWeek(userId: number): { label: string; avg: number } | null {
  const db = getDb();
  const rows = db
    .prepare(`SELECT date, mood FROM check_ins WHERE user_id = ?`)
    .all(userId) as Array<{ date: string; mood: number }>;
  if (rows.length === 0) return null;

  const buckets: Array<{ sum: number; count: number }> = Array(7)
    .fill(null)
    .map(() => ({ sum: 0, count: 0 }));
  for (const r of rows) {
    const dow = new Date(`${r.date}T00:00:00`).getDay();
    buckets[dow].sum += r.mood;
    buckets[dow].count += 1;
  }
  let bestDow = -1;
  let bestAvg = -Infinity;
  for (let i = 0; i < 7; i++) {
    if (buckets[i].count > 0) {
      const avg = buckets[i].sum / buckets[i].count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDow = i;
      }
    }
  }
  if (bestDow === -1) return null;
  return { label: DOW_LABELS[bestDow], avg: Number(bestAvg.toFixed(2)) };
}

export interface MoodHabitCorrelation {
  habitId: number;
  habitName: string;
  yesAvgMood: number | null;
  noAvgMood: number | null;
  delta: number | null;
}

export function getMoodHabitCorrelations(userId: number): MoodHabitCorrelation[] {
  const db = getDb();
  // gate: ≥ 14 distinct check-in days
  const distinct = (db
    .prepare(`SELECT COUNT(DISTINCT date) AS n FROM check_ins WHERE user_id = ?`)
    .get(userId) as { n: number }).n;
  if (distinct < 14) return [];

  const habits = db
    .prepare(
      `SELECT id, name FROM habits WHERE user_id = ? AND archived = 0 ORDER BY created_at ASC`,
    )
    .all(userId) as Array<{ id: number; name: string }>;

  return habits.map((h) => {
    const yes = db
      .prepare(
        `SELECT AVG(ci.mood) AS m FROM check_ins ci
         JOIN habit_logs hl ON hl.check_in_id = ci.id
         WHERE ci.user_id = ? AND hl.habit_id = ? AND hl.status = 'yes'`,
      )
      .get(userId, h.id) as { m: number | null };
    const no = db
      .prepare(
        `SELECT AVG(ci.mood) AS m FROM check_ins ci
         JOIN habit_logs hl ON hl.check_in_id = ci.id
         WHERE ci.user_id = ? AND hl.habit_id = ? AND hl.status != 'yes'`,
      )
      .get(userId, h.id) as { m: number | null };

    const delta =
      yes.m != null && no.m != null ? Number((yes.m - no.m).toFixed(2)) : null;

    return {
      habitId: h.id,
      habitName: h.name,
      yesAvgMood: yes.m != null ? Number(yes.m.toFixed(2)) : null,
      noAvgMood: no.m != null ? Number(no.m.toFixed(2)) : null,
      delta,
    };
  });
}

export function getReflectionsCount(userId: number): number {
  const db = getDb();
  return (db
    .prepare(
      `SELECT COUNT(*) AS n FROM check_ins WHERE user_id = ? AND reflection IS NOT NULL AND length(trim(reflection)) > 0`,
    )
    .get(userId) as { n: number }).n;
}
