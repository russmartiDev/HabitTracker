import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { hasApiKey } from '@/lib/ai';
import { ChatInterface } from '@/components/ChatInterface';
import { TonePicker } from '@/components/TonePicker';
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
    <div className="rise" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-wash">
        <div className="page-wash-inner">
          <div className="page-header">
            <div>
              <div className="notation-tag" style={{ marginBottom: 14 }}>
                COMPANION
              </div>
              <h1 className="page-title">Think out loud.</h1>
              <div className="row gap-8 wrap" style={{ alignItems: 'baseline' }}>
                <p className="page-subtitle" style={{ margin: 0 }}>
                  Context from your last 7 days · tone
                </p>
                <TonePicker currentPref={user.communication_pref} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="page-body-inner" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {!hasApiKey() && (
            <div
              className="card"
              style={{
                padding: 14,
                marginBottom: 12,
                background: 'var(--warn-soft)',
                borderColor: 'var(--warn)',
                fontSize: 13,
              }}
            >
              <strong>Chat is read-only.</strong> No <code>ANTHROPIC_API_KEY</code> in the
              server environment — sending a message will return a stub response.
            </div>
          )}

          <ChatInterface initialMessages={rows} greetingFirstName={firstName} />
        </div>
      </div>
    </div>
  );
}
