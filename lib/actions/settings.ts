'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

const profileSchema = z.object({
  name: z.string().trim().min(1).max(60),
  communication_pref: z.enum(['encouraging', 'direct', 'playful']),
});

export type ProfileState = { ok?: true; error?: string } | null;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    communication_pref: String(formData.get('communication_pref') ?? 'encouraging'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const db = getDb();
  db.prepare(
    `UPDATE users SET name = ?, communication_pref = ? WHERE id = ?`,
  ).run(parsed.data.name, parsed.data.communication_pref, user.id);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function resetUserDataAction(): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM check_ins WHERE user_id = ?').run(user.id);
    db.prepare('DELETE FROM mood_logs WHERE user_id = ?').run(user.id);
    db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(user.id);
    db.prepare('DELETE FROM user_badges WHERE user_id = ?').run(user.id);
    // habit_logs cascade via check_ins; nothing extra needed
  });
  tx();
  redirect('/dashboard');
}
