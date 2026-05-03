import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import argon2 from 'argon2';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import type { UserRow } from '@/lib/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (raw) => {
        const parsed = credSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const db = getDb();
        const user = db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(email.toLowerCase()) as UserRow | undefined;
        if (!user) return null;
        let ok = false;
        try {
          ok = await argon2.verify(user.password_hash, password);
        } catch {
          ok = false;
        }
        if (!ok) return null;
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.uid = (user as { id: string }).id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(session.user.id)) as
    | UserRow
    | undefined;
  return row ?? null;
}

export async function requireUser(): Promise<UserRow> {
  const u = await getCurrentUser();
  if (!u) throw new Error('UNAUTHENTICATED');
  return u;
}
