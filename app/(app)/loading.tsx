// Instant skeleton shown while a route's server component is loading.
// Mirrors the page-wash + body layout so the swap feels structural.

export default function Loading() {
  return (
    <div className="rise" style={{ opacity: 0.55 }}>
      <div
        className="page-wash"
        style={{ paddingTop: 36, paddingBottom: 28 }}
      >
        <div className="page-wash-inner">
          <div
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              border: '1px solid var(--line-strong)',
              borderRadius: 999,
              marginBottom: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'transparent',
            }}
          >
            ━━━━━
          </div>
          <div
            style={{
              height: 36,
              width: '40%',
              maxWidth: 320,
              background: 'var(--line)',
              borderRadius: 4,
              marginBottom: 12,
            }}
          />
          <div
            style={{
              height: 16,
              width: '60%',
              maxWidth: 480,
              background: 'var(--line-soft)',
              borderRadius: 4,
            }}
          />
        </div>
      </div>
      <div className="page-body">
        <div className="page-body-inner">
          <div
            className="card"
            style={{
              height: 200,
              background: 'var(--paper-warm)',
              borderColor: 'var(--line-soft)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
