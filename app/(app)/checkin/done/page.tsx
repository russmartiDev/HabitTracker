import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { Icon } from '@/components/Icon';
import { MOOD_FACES, MOOD_LABELS } from '@/components/visual';
import { CRISIS_BANNER_TEXT } from '@/lib/grading';
import { getBadgesByCodes } from '@/lib/badges';
import { getUserStats } from '@/lib/stats';
import type { CheckInRow } from '@/lib/types';
import { XpAnimation } from '@/components/XpAnimation';

interface SearchParams {
  id?: string;
  xp?: string;
  badges?: string;
  crisis?: string;
  already?: string;
}

export default async function CheckInDonePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  if (!params.id) redirect('/dashboard');

  const db = getDb();
  const ci = db
    .prepare('SELECT * FROM check_ins WHERE id = ? AND user_id = ?')
    .get(Number(params.id), user.id) as CheckInRow | undefined;

  if (!ci) redirect('/dashboard');

  const stats = getUserStats(user.id);
  const xpEarned = Number(params.xp ?? ci.xp_earned);
  const badgeCodes = (params.badges ?? '').split(',').filter(Boolean);
  const badges = getBadgesByCodes(badgeCodes);

  // habit summary
  const logs = db
    .prepare(`SELECT status FROM habit_logs WHERE check_in_id = ?`)
    .all(ci.id) as Array<{ status: string }>;
  const yesCount = logs.filter((l) => l.status === 'yes').length;
  const partialCount = logs.filter((l) => l.status === 'partial').length;

  return (
    <div className="onboard-stage">
      <div style={{ width: '100%', maxWidth: 580 }}>
        {params.crisis === '1' && (
          <div
            className="card"
            style={{
              padding: 14,
              marginBottom: 18,
              borderColor: 'var(--accent-deep)',
              background: 'var(--accent-tint)',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <strong>You&rsquo;re not alone.</strong> {CRISIS_BANNER_TEXT}
          </div>
        )}

        <XpAnimation target={xpEarned} />

        <div className="onboard-card rise" style={{ padding: '44px 44px 36px' }}>
          <div className="t-eyebrow row gap-6" style={{ marginBottom: 18 }}>
            <Icon name="sparkles" size={12} /> A note from your companion
          </div>
          <p
            className="h-display"
            style={{ fontSize: 26, lineHeight: 1.4, margin: '0 0 24px', color: 'var(--ink)' }}
          >
            &ldquo;{ci.ai_message ?? '—'}&rdquo;
          </p>

          <div className="hr" />

          <div className="row gap-12" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
            <SummaryItem
              label="Mood"
              content={
                <span>
                  <span style={{ fontSize: 22, marginRight: 6 }}>{MOOD_FACES[ci.mood - 1]}</span>
                  <span style={{ fontWeight: 500 }}>{MOOD_LABELS[ci.mood - 1]}</span>
                </span>
              }
            />
            <SummaryItem
              label="Habits"
              content={
                <span className="t-mono" style={{ fontWeight: 500 }}>
                  {yesCount} done · {partialCount} partial
                </span>
              }
            />
            <SummaryItem
              label="Streak"
              content={
                <span className="t-mono" style={{ fontWeight: 500 }}>
                  {stats.currentStreak} days{' '}
                  <span style={{ color: 'var(--accent-deep)' }}>↑</span>
                </span>
              }
            />
          </div>

          {badges.length > 0 && (
            <div
              style={{
                padding: 14,
                background: 'var(--ochre-soft)',
                borderRadius: 10,
                fontSize: 13,
                marginTop: 8,
              }}
            >
              <div className="row gap-8" style={{ marginBottom: badges.length > 1 ? 6 : 0 }}>
                <span style={{ fontSize: 18 }}>🌱</span>
                <strong>{badges.length === 1 ? badges[0].name : 'New badges'}</strong>
                {badges.length === 1 && <span> badge unlocked</span>}
              </div>
              {badges.length > 1 && (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {badges.map((b) => (
                    <li key={b.code}>{b.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Link
            href="/dashboard"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 28 }}
          >
            Continue to dashboard <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, content }: { label: string; content: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 130 }}>
      <div className="t-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>
        {label}
      </div>
      {content}
    </div>
  );
}
