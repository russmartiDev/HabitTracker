import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getUserStats } from '@/lib/stats';
import { containsCrisisKeyword } from '@/lib/grading';
import { streamChatReply } from '@/lib/ai';
import { evaluateAfterChatMessage } from '@/lib/badges';
import type { ChatMessageRow } from '@/lib/types';

const schema = z.object({
  message: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let parsed;
  try {
    parsed = schema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const { message } = parsed.data;
  const isCrisis = containsCrisisKeyword(message);

  const db = getDb();
  const now = Date.now();
  // Persist user message immediately.
  db.prepare(
    `INSERT INTO chat_messages (user_id, role, content, created_at) VALUES (?, 'user', ?, ?)`,
  ).run(user.id, message, now);

  // Award conversationalist badge on first user message (and only first).
  evaluateAfterChatMessage(user.id);

  // Build context.
  const stats = getUserStats(user.id);
  const recent = db
    .prepare(
      `SELECT ci.date, ci.mood,
        (SELECT COUNT(*) FROM habit_logs hl WHERE hl.check_in_id = ci.id AND hl.status = 'yes') AS yesCount,
        (SELECT COUNT(*) FROM habit_logs hl WHERE hl.check_in_id = ci.id) AS total
       FROM check_ins ci WHERE ci.user_id = ? ORDER BY ci.date DESC LIMIT 7`,
    )
    .all(user.id) as Array<{ date: string; mood: number; yesCount: number; total: number }>;

  // Trailing history (limit to last 20 messages including the one just inserted).
  const history = db
    .prepare(
      `SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
    )
    .all(user.id) as Pick<ChatMessageRow, 'role' | 'content'>[];
  history.reverse();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let fullText = '';
      let closed = false;
      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          /* downstream closed */
        }
      };

      streamChatReply({
        ctx: {
          userName: user!.name,
          goal: user!.goal,
          communicationPref: user!.communication_pref,
          streak: stats.currentStreak,
          level: stats.level,
          recent,
        },
        history,
        crisis: isCrisis,
        onText: (chunk) => {
          fullText += chunk;
          safeEnqueue(chunk);
        },
        onComplete: (full) => {
          // Persist assistant message (skip if it's the no-key fallback so we don't fill DB
          // with stub responses).
          const text = full || fullText || '';
          const isNoKeyStub = text.startsWith('Chat is unavailable');
          if (text && !isNoKeyStub) {
            db.prepare(
              `INSERT INTO chat_messages (user_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)`,
            ).run(user!.id, text, Date.now());
          }
          closed = true;
          controller.close();
        },
        onError: (err) => {
          const msg = `\n\n(error: ${err.message})`;
          safeEnqueue(msg);
          closed = true;
          controller.close();
        },
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Crisis': isCrisis ? '1' : '0',
    },
  });
}
