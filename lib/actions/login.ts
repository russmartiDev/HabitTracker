'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
  next: z.string().default('/dashboard'),
});

export type LoginState = { error?: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? ''),
    next: String(formData.get('next') ?? '/dashboard'),
  });
  if (!parsed.success) return { error: 'Invalid email or password' };

  const { email, password, next } = parsed.data;
  // Only accept internal-looking next paths.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) return { error: 'Invalid email or password' };
    throw err;
  }
  redirect(safeNext);
}
