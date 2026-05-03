import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { hasApiKey } from '@/lib/ai';
import { ChatInterface } from '@/components/ChatInterface';
import type { ChatMessageRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const user = await requireUser();
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 200`,
    )
    .all(user.id) as Pick<ChatMessageRow, 'role' | 'content'>[];

  const firstName = user.name.split(/\s+/)[0];

  return (
    <div className="rise" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>
            Companion
          </div>
          <h1 className="page-title">
            A space to <span className="ink-underline">think out loud</span>.
          </h1>
          <p className="page-subtitle">
            I have context from your last 7 days. Tone:{' '}
            <span style={{ textTransform: 'capitalize' }}>{user.communication_pref}</span>.
          </p>
        </div>
      </div>

      {!hasApiKey() && (
        <div
          className="card"
          style={{
            padding: 14,
            marginBottom: 12,
            background: 'var(--ochre-soft)',
            fontSize: 13,
          }}
        >
          <strong>Chat is read-only.</strong> No <code>ANTHROPIC_API_KEY</code> in the
          server environment — sending a message will return a stub response.
        </div>
      )}

      <ChatInterface initialMessages={rows} greetingFirstName={firstName} />
    </div>
  );
}
