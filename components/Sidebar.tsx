'use client';

import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';
import { NAV_ITEMS } from '@/components/visual';

interface Props {
  user: { name: string; level: number; streak: number; xp: number; xpForNext: number };
}

export function Sidebar({ user }: Props) {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="3" height="12" fill="currentColor" rx="0.5" />
            <text
              x="9"
              y="17"
              fontFamily="Inter, sans-serif"
              fontWeight="800"
              fontSize="14"
              fill="currentColor"
            >
              L
            </text>
          </svg>
        </div>
        <span>lichen</span>
      </div>

      <nav className="col gap-4" style={{ flex: '0 0 auto' }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch
              className={`nav-item ${active ? 'nav-item-active' : ''}`}
            >
              <Icon name={item.icon as IconName} size={16} />
              {item.label}
              <NavPending />
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        className="card card-warm"
        style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <div className="row gap-10" style={{ alignItems: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-pill)',
              background: 'var(--accent)',
              color: 'var(--paper)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              flexShrink: 0,
            }}
          >
            {user.name[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                lineHeight: 1.2,
                color: 'var(--ink-deep)',
              }}
            >
              {user.name}
            </div>
            <div
              className="t-mono"
              style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}
            >
              L{user.level} · {user.streak}d 🔥
            </div>
          </div>
        </div>
        <div className="progress" style={{ height: 4 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, (user.xp / Math.max(1, user.xpForNext)) * 100)}%`,
            }}
          />
        </div>
      </div>
    </aside>
  );
}

function NavPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      aria-hidden
      style={{
        marginLeft: 'auto',
        width: 6,
        height: 6,
        borderRadius: 999,
        background: 'currentColor',
        opacity: 0.6,
        animation: 'pop-in 0.5s ease-in-out infinite alternate',
      }}
    />
  );
}
