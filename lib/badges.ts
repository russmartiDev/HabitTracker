import { getDb } from '@/lib/db';
import { localDateString, shiftDate, dayOfWeek } from '@/lib/dates';
import type { CheckInRow } from '@/lib/types';

interface CheckInWithLogs extends CheckInRow {
  // augmented for evaluators
  habitLogs: Array<{ habit_id: number; status: string }>;
  hourLocal: number;
}

function award(userId: number, code: string): boolean {
  const db = getDb();
  // INSERT OR IGNORE returns changes=1 only if the row was actually inserted.
  // Saves a SELECT per badge.
  const r = db
    .prepare(
      `INSERT OR IGNORE INTO user_badges (user_id, badge_code, earned_at) VALUES (?, ?, ?)`,
    )
    .run(userId, code, Date.now());
  return r.changes === 1;
}

interface CheckInRecord {
  date: string;
  mood: number;
  reflectionLen: number;
  hour: number;
  habitYesIds: number[];
  habitNonYesIds: number[];
}

function loadHistory(userId: number): CheckInRecord[] {
  const db = getDb();
  // Single query — aggregate habit_logs into a JSON array so we don't do
  // N+1 round-trips. SQLite has json_group_array since 3.38.
  const rows = db
    .prepare(
      `SELECT
         ci.id, ci.date, ci.mood, ci.reflection, ci.created_at,
         (SELECT json_group_array(json_object('habit_id', habit_id, 'status', status))
          FROM habit_logs WHERE check_in_id = ci.id) AS logs_json
       FROM check_ins ci
       WHERE ci.user_id = ?
       ORDER BY ci.date DESC`,
    )
    .all(userId) as Array<{
    id: number;
    date: string;
    mood: number;
    reflection: string | null;
    created_at: number;
    logs_json: string | null;
  }>;

  return rows.map((r) => {
    const logs: Array<{ habit_id: number; status: string }> = r.logs_json
      ? JSON.parse(r.logs_json)
      : [];
    const yes: number[] = [];
    const nonYes: number[] = [];
    for (const l of logs) {
      if (l.status === 'yes') yes.push(l.habit_id);
      else nonYes.push(l.habit_id);
    }
    return {
      date: r.date,
      mood: r.mood,
      reflectionLen: (r.reflection ?? '').trim().length,
      hour: new Date(r.created_at).getHours(),
      habitYesIds: yes,
      habitNonYesIds: nonYes,
    };
  });
}

function within(dateRecent: string, dateOlder: string, days: number): boolean {
  // returns true if dateRecent and dateOlder are within `days` calendar days
  const d1 = new Date(`${dateRecent}T00:00:00`).getTime();
  const d2 = new Date(`${dateOlder}T00:00:00`).getTime();
  return Math.round((d1 - d2) / 86400000) <= days - 1;
}

export interface BadgeAwards {
  earned: { code: string }[];
}

/** Evaluate all check-in-driven badges and write any new awards. */
export function evaluateAfterCheckIn(userId: number, checkInId: number): BadgeAwards {
  const db = getDb();
  const earned: { code: string }[] = [];
  const tryAward = (code: string) => {
    if (award(userId, code)) earned.push({ code });
  };

  const history = loadHistory(userId);
  if (history.length === 0) return { earned };

  const today = history[0];

  // first_step
  if (history.length >= 1) tryAward('first_step');

  // week_warrior — current streak >= 7 (computed inline)
  let streak = 1;
  for (let i = 1; i < history.length; i++) {
    if (history[i].date === shiftDate(history[i - 1].date, -1)) streak++;
    else break;
  }
  if (streak >= 7) tryAward('week_warrior');
  if (streak >= 14) tryAward('fortnight_force');

  // monthly_master — 30 check-ins within rolling 30 days
  if (history.length >= 30) {
    const cutoff = shiftDate(today.date, -29);
    const inWindow = history.filter((h) => h.date >= cutoff).length;
    if (inWindow >= 30) tryAward('monthly_master');
  }

  // comeback_kid — gap of 3+ days before today
  if (history.length >= 2) {
    const a = new Date(`${history[0].date}T00:00:00`).getTime();
    const b = new Date(`${history[1].date}T00:00:00`).getTime();
    const gapDays = Math.round((a - b) / 86400000);
    if (gapDays >= 4) tryAward('comeback_kid'); // 3+ day gap = at least 4 days apart
  }

  // mood_mapper — moods logged on 7 distinct days
  const distinctMoodDays = new Set(history.map((h) => h.date)).size;
  if (distinctMoodDays >= 7) tryAward('mood_mapper');

  // honest_heart — low mood + reflection
  if (today.mood <= 2 && today.reflectionLen > 0) tryAward('honest_heart');

  // habit_hero — any habit with 21 yes counts
  const yesCounts = new Map<number, number>();
  for (const h of history) for (const hid of h.habitYesIds) yesCounts.set(hid, (yesCounts.get(hid) ?? 0) + 1);
  if (Array.from(yesCounts.values()).some((v) => v >= 21)) tryAward('habit_hero');

  // triple_threat — 3 habits done, 7 days running (each of last 7 days has at least 3 yes)
  if (history.length >= 7) {
    const last7 = history.slice(0, 7);
    // ensure they're consecutive
    let consecutive = true;
    for (let i = 1; i < last7.length; i++) {
      if (last7[i].date !== shiftDate(last7[i - 1].date, -1)) {
        consecutive = false;
        break;
      }
    }
    if (consecutive && last7.every((h) => h.habitYesIds.length >= 3)) tryAward('triple_threat');
  }

  // reflective_soul — 5 reflections
  if (history.filter((h) => h.reflectionLen > 0).length >= 5) tryAward('reflective_soul');

  // early_bird / night_owl — 5 distinct days w/ check-in <09:00 or >=21:00
  const earlyDays = new Set(history.filter((h) => h.hour < 9).map((h) => h.date));
  if (earlyDays.size >= 5) tryAward('early_bird');
  const nightDays = new Set(history.filter((h) => h.hour >= 21).map((h) => h.date));
  if (nightDays.size >= 5) tryAward('night_owl');

  // mood_rainbow — all 5 mood levels in a single calendar month
  const byMonth = new Map<string, Set<number>>();
  for (const h of history) {
    const m = h.date.slice(0, 7);
    if (!byMonth.has(m)) byMonth.set(m, new Set());
    byMonth.get(m)!.add(h.mood);
  }
  if (Array.from(byMonth.values()).some((s) => s.size >= 5)) tryAward('mood_rainbow');

  // deep_diver — 500+ char reflection
  if (history.some((h) => h.reflectionLen >= 500)) tryAward('deep_diver');

  return { earned };
}

/** Evaluate chat-message-driven badges. */
export function evaluateAfterChatMessage(userId: number): BadgeAwards {
  const earned: { code: string }[] = [];
  if (award(userId, 'conversationalist')) earned.push({ code: 'conversationalist' });
  return { earned };
}

export interface BadgeRow {
  code: string;
  name: string;
  description: string;
}

export interface BadgeWithEarned extends BadgeRow {
  earned_at: number | null;
}

export function getBadgeGallery(userId: number): BadgeWithEarned[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT b.code, b.name, b.description, ub.earned_at
       FROM badges b
       LEFT JOIN user_badges ub ON ub.badge_code = b.code AND ub.user_id = ?
       ORDER BY ub.earned_at IS NULL, b.code`,
    )
    .all(userId) as BadgeWithEarned[];
}

export function getBadgesByCodes(codes: string[]): BadgeRow[] {
  if (codes.length === 0) return [];
  const db = getDb();
  const placeholders = codes.map(() => '?').join(',');
  return db
    .prepare(`SELECT code, name, description FROM badges WHERE code IN (${placeholders})`)
    .all(...codes) as BadgeRow[];
}
