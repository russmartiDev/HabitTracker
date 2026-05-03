'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { hashPassword, signIn, signOut } from '@/lib/auth';
import type { UserRow } from '@/lib/types';

const signupSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email')
    .max(254)
    .refine((e) => !e.toLowerCase().endsWith('@lichen.local'), {
      message: 'That email domain is reserved',
    }),
  password: z.string().min(8, 'At least 8 characters').max(128),
  name: z.string().trim().min(1, 'Tell us what to call you').max(60),
});

export type SignupState = { error?: string } | null;

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? ''),
    name: String(formData.get('name') ?? ''),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { email, password, name } = parsed.data;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
    | Pick<UserRow, 'id'>
    | undefined;
  if (existing) return { error: 'An account with that email already exists' };

  const password_hash = await hashPassword(password);
  const aiDay = Math.floor(Math.random() * 7);

  db.prepare(
    `INSERT INTO users (email, password_hash, name, communication_pref, onboarding_completed, ai_day, created_at)
     VALUES (?, ?, ?, 'encouraging', 0, ?, ?)`,
  ).run(email, password_hash, name, aiDay, Date.now());

  // Sign the user in immediately.
  await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  redirect('/onboarding');
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}
