'use client';

import Link from 'next/link';
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
        <div className="logo-mark">l</div>
        <span>lichen</span>
      </div>

      <nav className="col gap-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`nav-item ${active ? 'nav-item-active' : ''}`}
            >
              <Icon name={item.icon as IconName} size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div className="card card-warm" style={{ padding: 14, marginTop: 8 }}>
        <div className="row gap-8" style={{ marginBottom: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent)',
              color: 'var(--paper)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
            }}
          >
            {user.name[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>{user.name}</div>
            <div className="tiny muted t-mono" style={{ fontSize: 10 }}>
              L{user.level} · {user.streak}d 🔥
            </div>
          </div>
        </div>
        <div className="progress" style={{ height: 4 }}>
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (user.xp / Math.max(1, user.xpForNext)) * 100)}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
