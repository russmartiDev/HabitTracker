// Anthropic integration. Server-only — never import from client code.
import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import type { CommunicationPref, ChatMessageRow } from '@/lib/types';

const MODEL_ID = 'claude-haiku-4-5-20251001';
const ANALYZE_TIMEOUT_MS = 15_000;
const CHAT_TIMEOUT_MS = 60_000;
const MAX_ANALYZE_TOKENS = 200;
const MAX_CHAT_TOKENS = 400;

let _client: Anthropic | null = null;

function client(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (_client) return _client;
  _client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  return _client;
}

export function hasApiKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const TONE_INSTRUCTIONS: Record<CommunicationPref, string> = {
  encouraging: 'Be warm, supportive, and kind. Cheer the user on without being saccharine.',
  direct: 'Be honest, concise, and to the point. No fluff. Respect their time.',
  playful: 'Be witty and a little teasing. Keep it light. Never mean.',
};

const SAFETY_PREAMBLE =
  'You are a warm habit-tracker companion, not a therapist. Never diagnose, prescribe, or give medical advice. ' +
  'If the user expresses crisis or self-harm, gently encourage them to reach out to 988 (US) or findahelpline.com (international). ' +
  'Keep replies short — typically 1–3 sentences. No markdown, no bullet lists, no headers.';

// ---------------- Check-in analysis ----------------

export interface AnalyzeContext {
  userName: string;
  goal: string | null;
  communicationPref: CommunicationPref;
  todayMood: number;
  todayHabitYesCount: number;
  todayHabitTotal: number;
  todayReflection: string;
  recent: Array<{ date: string; mood: number; yesCount: number; total: number }>;
}

function analyzePrompt(ctx: AnalyzeContext): string {
  const recentSummary = ctx.recent
    .map(
      (r) =>
        `  - ${r.date}: mood ${r.mood}/5, habits ${r.yesCount}/${r.total}`,
    )
    .join('\n') || '  (no prior check-ins yet)';

  return `User profile:
  name: ${ctx.userName}
  goal: ${ctx.goal ?? 'unspecified'}
  preferred tone: ${ctx.communicationPref}

Today's check-in:
  mood: ${ctx.todayMood}/5
  habits done: ${ctx.todayHabitYesCount}/${ctx.todayHabitTotal}
  reflection: ${ctx.todayReflection ? `"${ctx.todayReflection}"` : '(none)'}

Last 7 days:
${recentSummary}

Write ONE short message (1–3 sentences, no markdown) of one of these types:
- praise (high completion, high mood)
- insight (a pattern you noticed)
- gentle nudge (mid effort or mid mood)
- supportive (low mood)

Pick whichever fits today best. Address the user by name only if it feels natural.`;
}

/**
 * Returns a personalized message string, or null if AI is unavailable / errors.
 */
export async function analyzeCheckIn(ctx: AnalyzeContext): Promise<string | null> {
  const c = client();
  if (!c) return null;

  const system = `${SAFETY_PREAMBLE}\n\n${TONE_INSTRUCTIONS[ctx.communicationPref]}`;
  const prompt = analyzePrompt(ctx);

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ANALYZE_TIMEOUT_MS);
    try {
      const resp = await c.messages.create(
        {
          model: MODEL_ID,
          max_tokens: MAX_ANALYZE_TOKENS,
          system,
          messages: [{ role: 'user', content: prompt }],
        },
        { signal: ctrl.signal },
      );
      const text = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      return text || null;
    } finally {
      clearTimeout(t);
    }
  } catch (err) {
    // Log and fall back. The caller will use the algorithmic message.
    // eslint-disable-next-line no-console
    console.warn('[ai] analyzeCheckIn failed:', (err as Error).message);
    return null;
  }
}

// ---------------- Chat (streaming) ----------------

export interface ChatContext {
  userName: string;
  goal: string | null;
  communicationPref: CommunicationPref;
  streak: number;
  level: number;
  recent: Array<{ date: string; mood: number; yesCount: number; total: number }>;
}

function chatSystemPrompt(ctx: ChatContext): string {
  const recentSummary = ctx.recent.length
    ? ctx.recent
        .map((r) => `  ${r.date}: mood ${r.mood}/5, ${r.yesCount}/${r.total} habits`)
        .join('\n')
    : '  (no recent check-ins)';

  return `${SAFETY_PREAMBLE}

${TONE_INSTRUCTIONS[ctx.communicationPref]}

User context:
  name: ${ctx.userName}
  goal: ${ctx.goal ?? 'unspecified'}
  current streak: ${ctx.streak} days, level ${ctx.level}

Last 7 days of check-ins:
${recentSummary}`;
}

const FALLBACK_CHAT_RESPONSE =
  'Chat is unavailable — no API key configured. ' +
  'Ask the administrator to set ANTHROPIC_API_KEY in the server environment.';

const HARDCODED_CRISIS_RESPONSE =
  "I hear you, and I'm glad you said something. Please reach out to someone right now. " +
  'In the US, call or text 988. Outside the US, see findahelpline.com for local options. ' +
  "You don't have to be alone with this.";

interface StreamArgs {
  ctx: ChatContext;
  history: Pick<ChatMessageRow, 'role' | 'content'>[];
  onText: (chunk: string) => void;
  onComplete: (full: string) => void;
  onError: (err: Error) => void;
  /** When true, skip Claude and emit the hard-coded supportive reply. */
  crisis?: boolean;
}

export async function streamChatReply(args: StreamArgs): Promise<void> {
  if (args.crisis) {
    args.onText(HARDCODED_CRISIS_RESPONSE);
    args.onComplete(HARDCODED_CRISIS_RESPONSE);
    return;
  }

  const c = client();
  if (!c) {
    args.onText(FALLBACK_CHAT_RESPONSE);
    args.onComplete(FALLBACK_CHAT_RESPONSE);
    return;
  }

  const system = chatSystemPrompt(args.ctx);

  // Map history to Anthropic format. Treat the last entry as the new user message.
  const messages = args.history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), CHAT_TIMEOUT_MS);
    let full = '';
    try {
      // Use prompt caching on the system block (5-min TTL) so multi-turn within a session reuses it.
      const stream = c.messages.stream(
        {
          model: MODEL_ID,
          max_tokens: MAX_CHAT_TOKENS,
          // Prompt caching on the system block (5-min TTL) — beneficial for multi-turn chat.
          // SDK 0.30 doesn't yet type cache_control on TextBlockParam; cast to bypass.
          system: [
            {
              type: 'text',
              text: system,
              cache_control: { type: 'ephemeral' },
            },
          ] as unknown as Anthropic.TextBlockParam[],
          messages,
        },
        { signal: ctrl.signal },
      );

      for await (const evt of stream) {
        if (
          evt.type === 'content_block_delta' &&
          evt.delta.type === 'text_delta'
        ) {
          const piece = evt.delta.text;
          full += piece;
          args.onText(piece);
        }
      }
      args.onComplete(full || 'Hmm, nothing to say to that — tell me more?');
    } finally {
      clearTimeout(t);
    }
  } catch (err) {
    args.onError(err as Error);
  }
}

export { MODEL_ID };
