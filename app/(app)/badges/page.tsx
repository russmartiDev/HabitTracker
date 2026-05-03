import { requireUser } from '@/lib/auth';
import { getBadgeGallery } from '@/lib/badges';

export default async function BadgesPage() {
  const user = await requireUser();
  const badges = getBadgeGallery(user.id);
  return (
    <div className="rise">
      <div className="page-header">
        <div>
          <div className="t-eyebrow">Awards</div>
          <h1 className="page-title">Badges</h1>
          <p className="page-subtitle">
            {badges.filter((b) => b.earned_at).length} of {badges.length} earned
          </p>
        </div>
      </div>
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
