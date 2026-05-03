// Instant skeleton shown while a route's server component is loading.
// Renders inside the (app) layout so the sidebar stays mounted — only the
// main content swaps. Keeps user-perceived feedback under one frame.

export default function Loading() {
  return (
    <div className="rise" style={{ opacity: 0.6 }}>
      <div
        style={{
          height: 14,
          width: 90,
          background: 'var(--line)',
          borderRadius: 4,
          marginBottom: 12,
        }}
      />
      <div
        style={{
          height: 32,
          width: '60%',
          maxWidth: 360,
          background: 'var(--line-soft)',
          borderRadius: 6,
          marginBottom: 10,
        }}
      />
      <div
        style={{
          height: 18,
          width: '45%',
          maxWidth: 280,
          background: 'var(--line-soft)',
          borderRadius: 4,
          marginBottom: 28,
        }}
      />
      <div
        className="card"
        style={{
          height: 180,
          background: 'var(--paper-warm)',
          borderColor: 'var(--line-soft)',
        }}
      />
    </div>
  );
}
