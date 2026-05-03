'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { localDateString } from '@/lib/dates';
import { getActiveHabits } from '@/lib/habits';
import { getUserStats } from '@/lib/stats';
import {
  computeXp,
  selectGradingPath,
  pickAlgorithmicMessage,
  aiCallsInTrailingWeek,
  containsCrisisKeyword,
  type CheckInPayload,
} from '@/lib/grading';
import { evaluateAfterCheckIn } from '@/lib/badges';
import { analyzeCheckIn } from '@/lib/ai';

const habitAnswerSchema = z.object({
  habit_id: z.number().int().positive(),
  status: z.enum(['yes', 'no', 'partial']),
});

const payloadSchema = z.object({
  mood: z.number().int().min(1).max(5),
  habitAnswers: z.array(habitAnswerSchema).max(10),
  reflection: z.string().max(500).default(''),
});

export interface CheckInSubmitResult {
  ok: true;
  redirectTo: string;
}

export async function submitCheckInAction(raw: unknown): Promise<CheckInSubmitResult> {
  const user = await requireUser();
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid check-in payload');
  }
  const payload = parsed.data as CheckInPayload;

  const db = getDb();
  const today = localDateString();

  const existing = db
    .prepare('SELECT id FROM check_ins WHERE user_id = ? AND date = ?')
    .get(user.id, today) as { id: number } | undefined;
  if (existing) {
    redirect('/checkin/done?already=1');
  }

  const activeHabits = getActiveHabits(user.id);
  const activeIds = new Set(activeHabits.slice(0, 3).map((h) => h.id));

  // Filter habit answers to only those for current active-top-3 habits.
  const cleanedAnswers = payload.habitAnswers.filter((a) => activeIds.has(a.habit_id));

  const cleanPayload: CheckInPayload = {
    mood: payload.mood as 1 | 2 | 3 | 4 | 5,
    habitAnswers: cleanedAnswers,
    reflection: payload.reflection.slice(0, 500),
  };

  const xpEarned = computeXp(cleanPayload, activeIds.size);
  const prevStats = getUserStats(user.id);
  const newTotalXp = prevStats.totalXp + xpEarned;

  let aiPath = selectGradingPath({
    user,
    todayMood: cleanPayload.mood,
    newTotalXp,
    prevTotalXp: prevStats.totalXp,
  });

  // Rate cap — refuse AI path if user already had 10 in last 7 days.
  if (aiPath === 'ai' && aiCallsInTrailingWeek(user.id) >= 10) {
    aiPath = 'algorithmic';
  }

  // Generate the message.
  let message: string | null = null;
  let finalPath = aiPath;

  if (aiPath === 'ai') {
    try {
      const recent = db
        .prepare(
          `SELECT ci.date, ci.mood,
            (SELECT COUNT(*) FROM habit_logs hl WHERE hl.check_in_id = ci.id AND hl.status = 'yes') AS yesCount,
            (SELECT COUNT(*) FROM habit_logs hl WHERE hl.check_in_id = ci.id) AS total
           FROM check_ins ci
           WHERE ci.user_id = ?
           ORDER BY ci.date DESC LIMIT 7`,
        )
        .all(user.id) as Array<{ date: string; mood: number; yesCount: number; total: number }>;

      message = await analyzeCheckIn({
        userName: user.name,
        goal: user.goal,
        communicationPref: user.communication_pref,
        todayMood: cleanPayload.mood,
        todayHabitYesCount: cleanPayload.habitAnswers.filter((a) => a.status === 'yes').length,
        todayHabitTotal: activeIds.size,
        todayReflection: cleanPayload.reflection,
        recent,
      });
    } catch {
      message = null;
    }

    if (message === null) {
      finalPath = 'algorithmic';
    }
  }

  if (message === null) {
    message = pickAlgorithmicMessage({
      payload: cleanPayload,
      totalActiveHabits: activeIds.size,
      pref: user.communication_pref,
    });
  }

  // Crisis keyword scan on reflection — leave the message intact, but the
  // check-in done view will prepend the hotline banner when this flag is set.
  // We persist the flag implicitly: the reflection text is what's checked.

  // Insert in transaction
  const insertCi = db.prepare(
    `INSERT INTO check_ins (user_id, date, mood, reflection, xp_earned, ai_path, ai_message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertLog = db.prepare(
    `INSERT INTO habit_logs (check_in_id, habit_id, status) VALUES (?, ?, ?)`,
  );

  let checkInId = 0;
  const tx = db.transaction(() => {
    const r = insertCi.run(
      user.id,
      today,
      cleanPayload.mood,
      cleanPayload.reflection || null,
      xpEarned,
      finalPath,
      message,
      Date.now(),
    );
    checkInId = Number(r.lastInsertRowid);
    for (const a of cleanPayload.habitAnswers) {
      insertLog.run(checkInId, a.habit_id, a.status);
    }
  });
  tx();

  // Evaluate badges (after the row exists)
  const { earned } = evaluateAfterCheckIn(user.id, checkInId);

  const params = new URLSearchParams({
    id: String(checkInId),
    xp: String(xpEarned),
    badges: earned.map((b) => b.code).join(','),
  });
  if (containsCrisisKeyword(cleanPayload.reflection)) params.set('crisis', '1');

  redirect(`/checkin/done?${params.toString()}`);
}
