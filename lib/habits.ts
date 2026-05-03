import { getDb } from '@/lib/db';
import type { HabitRow } from '@/lib/types';

/** Active (non-archived) habits, most recently created first. */
export function getActiveHabits(userId: number): HabitRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM habits WHERE user_id = ? AND archived = 0 ORDER BY created_at DESC, id DESC`,
    )
    .all(userId) as HabitRow[];
}

/** First N active habits — N defaults to 3 (max questions per check-in). */
export function getCheckInHabits(userId: number, n = 3): HabitRow[] {
  return getActiveHabits(userId).slice(0, n);
}
