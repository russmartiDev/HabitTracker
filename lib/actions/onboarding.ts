'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import type { ActiveTime, CommunicationPref, Goal } from '@/lib/types';

const schema = z.object({
  goal: z.enum(['health', 'productivity', 'mental_wellness', 'learning', 'relationships']),
  active_time: z.enum(['morning', 'afternoon', 'evening', 'night']),
  habits: z.array(z.string().trim().min(1).max(60)).min(1, 'Pick at least one habit'),
  communication_pref: z.enum(['encouraging', 'direct', 'playful']),
});

export interface OnboardingPayload {
  goal: Goal;
  active_time: ActiveTime;
  habits: string[];
  communication_pref: CommunicationPref;
}

export async function submitOnboardingAction(payload: OnboardingPayload): Promise<void> {
  const user = await requireUser();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid onboarding submission');
  }
  const { goal, active_time, habits, communication_pref } = parsed.data;

  const db = getDb();
  const now = Date.now();

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE users SET goal = ?, active_time = ?, communication_pref = ?, onboarding_completed = 1
       WHERE id = ?`,
    ).run(goal, active_time, communication_pref, user.id);

    const insert = db.prepare(
      `INSERT INTO habits (user_id, name, type, archived, created_at) VALUES (?, ?, 'binary', 0, ?)`,
    );
    for (const name of habits) insert.run(user.id, name, now);
  });
  tx();

  redirect('/dashboard');
}
