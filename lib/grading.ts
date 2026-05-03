import { getDb } from '@/lib/db';
import { localDateString, shiftDate, dayOfWeek } from '@/lib/dates';
import { levelDelta } from '@/lib/stats';
import type {
  AiPath,
  CheckInRow,
  CommunicationPref,
  HabitStatus,
  UserRow,
} from '@/lib/types';

// ---------------- XP ----------------

export interface CheckInPayload {
  mood: 1 | 2 | 3 | 4 | 5;
  habitAnswers: Array<{ habit_id: number; status: HabitStatus }>;
  reflection: string;
}

export function computeXp(
  payload: CheckInPayload,
  totalActiveHabits: number,
): number {
  let xp = 10; // base check-in
  // mood logged is always present (required), so +2
  xp += 2;
  // all habit questions answered (no skips) — only if habits exist
  if (totalActiveHabits > 0 && payload.habitAnswers.length === totalActiveHabits) xp += 5;
  // reflection (non-empty after trim)
  if (payload.reflection.trim().length > 0) xp += 3;
  return xp;
}

// ---------------- Path selection ----------------

interface PathContext {
  user: UserRow;
  todayMood: 1 | 2 | 3 | 4 | 5;
  newTotalXp: number;
  prevTotalXp: number;
}

export function selectGradingPath(ctx: PathContext): AiPath {
  const today = localDateString();
  const isAiDayOfWeek = dayOfWeek(today) === ctx.user.ai_day;
  const leveledUp = levelDelta(ctx.prevTotalXp, ctx.newTotalXp) > 0;

  // Low-mood streak: today + previous 2 check-ins all <= 2
  const db = getDb();
  let lowMoodStreak = false;
  if (ctx.todayMood <= 2) {
    const prev2 = db
      .prepare('SELECT mood FROM check_ins WHERE user_id = ? ORDER BY date DESC LIMIT 2')
      .all(ctx.user.id) as { mood: number }[];
    if (prev2.length === 2 && prev2[0].mood <= 2 && prev2[1].mood <= 2) {
      lowMoodStreak = true;
    }
  }

  if (isAiDayOfWeek || leveledUp || lowMoodStreak) return 'ai';
  return 'algorithmic';
}

export function aiCallsInTrailingWeek(userId: number): number {
  const db = getDb();
  const cutoff = shiftDate(localDateString(), -6);
  const r = db
    .prepare(
      `SELECT COUNT(*) AS n FROM check_ins WHERE user_id = ? AND ai_path = 'ai' AND date >= ?`,
    )
    .get(userId, cutoff) as { n: number };
  return r.n;
}

// ---------------- Algorithmic message templates ----------------

interface MsgKey {
  bucket: 'praise' | 'insight' | 'nudge' | 'support';
  pref: CommunicationPref;
}

const TEMPLATES: Record<MsgKey['bucket'], Record<CommunicationPref, string[]>> = {
  praise: {
    encouraging: [
      'You showed up today. That counts more than most things.',
      'Look at you go. Three habits, full mood, real reflection — proud of you.',
      'This is the texture of a good week. Keep weaving.',
      'You said the small yes today. That stacks.',
    ],
    direct: [
      'Solid check-in. Repeat tomorrow.',
      'Habits done, mood logged, reflection written. That is the bar.',
      "Don't break the chain. You're doing this right.",
      'Consistent. Good.',
    ],
    playful: [
      'Look who showed up swinging.',
      'A full check-in? Outrageous behavior. Keep it up.',
      'Streak gods smile upon thee.',
      'You vs. yesterday: today wins.',
    ],
  },
  insight: {
    encouraging: [
      'Gentle pattern: you tend to feel better on days you move. Good fuel.',
      'The reflections you wrote this week have a quiet honesty in them. That matters.',
      'Mood and effort lined up today. Notice how that felt.',
    ],
    direct: [
      'Mood follows action here. Track that.',
      'Your good days correlate with the habits you actually do. Predictable. Useful.',
      'Reflection length matters less than reflection honesty. Keep doing it.',
    ],
    playful: [
      'Plot twist: doing the habits makes you feel better. Wild stuff.',
      "The data is in. Verdict: you're more like yourself when you take care of yourself.",
      'Behavioral science would like a word. You may be onto something.',
    ],
  },
  nudge: {
    encouraging: [
      'Today was a partial win. Counting it.',
      'Mood was lower today — the fact that you still checked in matters.',
      'Some days are like this. You came anyway. That is the whole point.',
    ],
    direct: [
      "Mid-effort day. That's fine. Tomorrow is fresh.",
      "Skipped some habits. Don't make it a habit. Reset.",
      'Average day. Now. What is one small thing for tomorrow?',
    ],
    playful: [
      'Today was a B-minus. Still passing.',
      'A sleeper episode of your life. Plot resumes tomorrow.',
      'Beige day. Tomorrow can be a color.',
    ],
  },
  support: {
    encouraging: [
      "Tough day. You're still here. That's real.",
      "You don't have to fix anything tonight. Just rest.",
      'Showing up here on a low day — that takes more than people give credit for.',
    ],
    direct: [
      'Hard day. Note it. Move on.',
      "You're not behind. Sleep is allowed to be the answer.",
      "Don't problem-solve at low energy. Just close the day.",
    ],
    playful: [
      'Today was a long day in disguise as a regular day. You earned the couch.',
      "Universe is being a lot today. Permission granted to soft-launch tomorrow.",
      'Boss fight: today. Result: survived. That counts.',
    ],
  },
};

interface MessageContext {
  payload: CheckInPayload;
  totalActiveHabits: number;
  pref: CommunicationPref;
}

export function pickAlgorithmicMessage(ctx: MessageContext): string {
  const completion =
    ctx.totalActiveHabits === 0
      ? 1
      : ctx.payload.habitAnswers.filter((a) => a.status === 'yes').length /
        Math.max(1, ctx.totalActiveHabits);

  const mood = ctx.payload.mood;

  let bucket: MsgKey['bucket'];
  if (mood <= 2) bucket = 'support';
  else if (mood >= 4 && completion >= 0.7) bucket = 'praise';
  else if (mood >= 3 && completion >= 0.5) bucket = 'insight';
  else bucket = 'nudge';

  const pool = TEMPLATES[bucket][ctx.pref] ?? TEMPLATES[bucket].encouraging;
  // pick stable-but-varying — based on date hash so the same day always shows the same one
  const seed = localDateString().split('-').reduce((a, c) => a * 31 + Number(c), 0);
  return pool[Math.abs(seed) % pool.length];
}

// ---------------- Crisis keyword scanner ----------------

const CRISIS_PATTERNS = [
  /\bsuicid/i,
  /\bkill myself\b/i,
  /\bkill\s+me\b/i,
  /\bend it all\b/i,
  /\bend\s+it\s+(?:all|tonight|now)\b/i,
  /\bhurt\s+myself\b/i,
  /\bself[-\s]?harm/i,
  /\bdon'?t\s+want\s+to\s+(?:be\s+here|live)\b/i,
  /\bnot\s+worth\s+living\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
];

export function containsCrisisKeyword(text: string): boolean {
  if (!text) return false;
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

export { CRISIS_BANNER_TEXT } from '@/lib/constants';

export function getCheckIn(checkInId: number): CheckInRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM check_ins WHERE id = ?').get(checkInId) as
    | CheckInRow
    | undefined;
}
