import { getDb } from '@/lib/db';
import { localDateString, shiftDate } from '@/lib/dates';
import type { CheckInRow, UserStats } from '@/lib/types';

// Level curve per gamification spec.
//   L1→2: 50, L2→3: 120, L_N→N+1: prev + 70*N (cumulative thresholds)
// threshold(1) = 0; threshold(2) = 50; threshold(3) = 120; threshold(4) = 120 + 70*3 = 330; etc.
export function levelThreshold(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 50;
  let t = 50;
  for (let n = 2; n < level; n++) t += 70 * n;
  return t;
}

export function levelFromXp(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
} {
  let level = 1;
  // walk forward — for a tracker that maxes maybe 100 levels, this is trivial.
  while (totalXp >= levelThreshold(level + 1)) level++;
  const lower = levelThreshold(level);
  const upper = levelThreshold(level + 1);
  return { level, xpInLevel: totalXp - lower, xpForNextLevel: upper - lower };
}

export function levelDelta(prevTotalXp: number, newTotalXp: number): number {
  return levelFromXp(newTotalXp).level - levelFromXp(prevTotalXp).level;
}

function computeStreak(dates: string[], today: string): { current: number; longest: number } {
  // dates: sorted DESC, unique YYYY-MM-DD strings.
  if (dates.length === 0) return { current: 0, longest: 0 };

  // current streak — must end at today or yesterday
  let current = 0;
  if (dates[0] === today || dates[0] === shiftDate(today, -1)) {
    current = 1;
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] === shiftDate(dates[i - 1], -1)) current++;
      else break;
    }
  }

  // longest — scan all
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i] === shiftDate(dates[i - 1], -1)) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return { current, longest };
}

export function getUserStats(userId: number): UserStats {
  const db = getDb();
  const rows = db
    .prepare('SELECT date, xp_earned FROM check_ins WHERE user_id = ? ORDER BY date DESC')
    .all(userId) as Pick<CheckInRow, 'date' | 'xp_earned'>[];

  const totalXp = rows.reduce((acc, r) => acc + r.xp_earned, 0);
  const { level, xpInLevel, xpForNextLevel } = levelFromXp(totalXp);
  const today = localDateString();
  const { current, longest } = computeStreak(
    rows.map((r) => r.date),
    today,
  );

  return {
    currentStreak: current,
    longestStreak: longest,
    totalXp,
    level,
    xpInLevel,
    xpForNextLevel,
    daysActive: rows.length,
    lastCheckInDate: rows[0]?.date ?? null,
  };
}

export interface MoodPoint {
  date: string;
  mood: number;
}

/** Mood values for the past N days, oldest first. Days without check-in have mood=0 (rendered as a baseline). */
export function getRecentMoods(userId: number, days = 7): MoodPoint[] {
  const db = getDb();
  const today = localDateString();
  const start = shiftDate(today, -(days - 1));
  const rows = db
    .prepare(
      `SELECT date, mood FROM check_ins WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC`,
    )
    .all(userId, start, today) as Array<{ date: string; mood: number }>;
  const map = new Map(rows.map((r) => [r.date, r.mood]));
  const out: MoodPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = shiftDate(today, -i);
    out.push({ date: d, mood: map.get(d) ?? 0 });
  }
  return out;
}

export type CalendarStatus = 'done' | 'partial' | 'miss' | 'today' | 'future' | 'empty';
export interface CalendarCell {
  date: string;
  day: number;
  status: CalendarStatus;
}

/** Build a 7-column calendar grid for the given (year, month0) covering the user's check-ins. */
export function getMonthCalendar(
  userId: number,
  year: number,
  month0: number,
): CalendarCell[] {
  const db = getDb();
  const monthStr = `${year}-${String(month0 + 1).padStart(2, '0')}`;
  const rows = db
    .prepare(
      `SELECT ci.date,
        (SELECT COUNT(*) FROM habit_logs hl WHERE hl.check_in_id = ci.id AND hl.status = 'yes') AS yesCount,
        (SELECT COUNT(*) FROM habit_logs hl WHERE hl.check_in_id = ci.id) AS total
       FROM check_ins ci
       WHERE ci.user_id = ? AND ci.date LIKE ?`,
    )
    .all(userId, `${monthStr}-%`) as Array<{ date: string; yesCount: number; total: number }>;
  const byDate = new Map(rows.map((r) => [r.date, r]));

  const today = localDateString();
  const firstDow = new Date(year, month0, 1).getDay(); // 0..6
  const lastDay = new Date(year, month0 + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ date: '', day: 0, status: 'empty' });
  }
  for (let d = 1; d <= lastDay; d++) {
    const date = `${monthStr}-${String(d).padStart(2, '0')}`;
    let status: CalendarStatus;
    if (date === today) status = 'today';
    else if (date > today) status = 'future';
    else {
      const r = byDate.get(date);
      if (!r) status = 'miss';
      else if (r.total > 0 && r.yesCount === r.total) status = 'done';
      else if (r.total > 0 && r.yesCount > 0) status = 'partial';
      else status = 'done'; // mood-only check-in (no habits) — count as done
    }
    cells.push({ date, day: d, status });
  }
  return cells;
}

export function getTodayCheckIn(userId: number): CheckInRow | null {
  const db = getDb();
  const today = localDateString();
  const row = db
    .prepare('SELECT * FROM check_ins WHERE user_id = ? AND date = ?')
    .get(userId, today) as CheckInRow | undefined;
  return row ?? null;
}
