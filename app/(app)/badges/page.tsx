import { requireUser } from '@/lib/auth';
import { getBadgeGallery } from '@/lib/badges';

export default async function BadgesPage() {
  const user = await requireUser();
  const badges = getBadgeGallery(user.id);
  const earnedCount = badges.filter((b) => b.earned_at).length;
  return (
    <div className="rise">
      <h1 className="page-title" style={{ fontSize: 32, margin: '0 0 4px' }}>
        <span className="h-display" style={{ color: 'var(--accent-deep)' }}>
          {earnedCount}
        </span>{' '}
        of {badges.length} earned.
      </h1>
      <p className="lede">
        Little markers along the way. Not the point — but nice when they show up.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {badges.map((b) => {
          const earned = !!b.earned_at;
          return (
            <div key={b.code} className={`badge-tile ${earned ? '' : 'badge-tile-locked'}`}>
              <div className="badge-icon">{earned ? '★' : '·'}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{b.name}</div>
              <div className="tiny muted">{b.description}</div>
              {earned && (
                <div className="tiny faint t-mono" style={{ marginTop: 8 }}>
                  {new Date(b.earned_at!).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
