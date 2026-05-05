'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';

export function XpAnimation({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      if (i >= target) {
        setN(target);
        clearInterval(t);
      } else {
        setN(i);
      }
    }, 40);
    return () => clearInterval(t);
  }, [target]);

  return (
    <div className="pop" style={{ textAlign: 'center', marginBottom: 28 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 18px',
          background: 'var(--ink-deep)',
          borderRadius: 999,
          color: 'var(--finesse-yellow)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.05em',
        }}
      >
        <Icon name="sparkles" size={14} stroke={2.4} />+{n} XP
      </div>
    </div>
  );
}
