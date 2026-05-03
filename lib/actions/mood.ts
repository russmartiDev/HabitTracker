'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

const schema = z.object({
  mood: z.number().int().min(1).max(5),
  tags: z.array(z.string().min(1).max(20)).max(7).default([]),
  note: z.string().max(140).default(''),
});

export interface MoodLogPayload {
  mood: number;
  tags: string[];
  note: string;
}

export async function logMoodAction(raw: MoodLogPayload): Promise<void> {
  const user = await requireUser();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid mood log');
  }
  const { mood, tags, note } = parsed.data;

  const db = getDb();

  // ≤ 5 per local day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();
  const todayEndMs = todayStartMs + 86400000;
  const count = (db
    .prepare(
      `SELECT COUNT(*) AS n FROM mood_logs WHERE user_id = ? AND logged_at >= ? AND logged_at < ?`,
    )
    .get(user.id, todayStartMs, todayEndMs) as { n: number }).n;

  if (count >= 5) {
    throw new Error("You've logged your mood 5 times today — see you tomorrow.");
  }

  db.prepare(
    `INSERT INTO mood_logs (user_id, mood, tags, note, logged_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(
    user.id,
    mood,
    tags.length ? JSON.stringify(tags) : null,
    note.trim() || null,
    Date.now(),
  );

  redirect('/dashboard');
}
