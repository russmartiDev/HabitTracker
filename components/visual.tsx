// Shared display primitives ported from Design/components.jsx.

export function FlameStamp({ size = 64 }: { size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id="flame-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.16 35)" />
            <stop offset="60%" stopColor="oklch(0.68 0.16 50)" />
            <stop offset="100%" stopColor="oklch(0.82 0.14 75)" />
          </linearGradient>
        </defs>
        <path
          d="M32 6 C 36 14, 28 18, 32 24 C 36 20, 40 22, 42 28 C 44 32, 47 36, 47 42 C 47 51, 40 58, 32 58 C 24 58, 17 51, 17 42 C 17 36, 21 32, 22 28 C 24 32, 27 30, 27 26 C 30 28, 33 24, 32 18 C 33 12, 32 8, 32 6 Z"
          fill="url(#flame-grad)"
          stroke="oklch(0.45 0.14 35)"
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <path
          d="M28 38 C 28 34, 32 32, 33 36 C 36 34, 38 38, 36 44 C 35 50, 28 50, 27 44 C 26 41, 27 39, 28 38 Z"
          fill="oklch(0.92 0.10 85)"
          opacity={0.85}
        />
      </svg>
    </div>
  );
}

export function Squiggle({ width = 80, color = 'currentColor' }: { width?: number; color?: string }) {
  return (
    <svg viewBox="0 0 80 8" width={width} height={8} style={{ display: 'block' }}>
      <path
        d="M2,5 Q12,1 22,4 T42,3 T62,4 T78,3"
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkline({
  values,
  color = 'var(--accent)',
  height = 36,
  fill = false,
}: {
  values: number[];
  color?: string;
  height?: number;
  fill?: boolean;
}) {
  if (!values.length) return null;
  const w = 100;
  const h = height;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1 || 1);
  const pts = values.map((v, i) => [i * step, h - 6 - ((v - min) / range) * (h - 12)] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="spark" style={{ height }}>
      {fill && <path d={area} fill={color} opacity={0.12} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 2.5 : 1.4} fill={color} />
      ))}
    </svg>
  );
}

export const MOOD_FACES = ['😞', '😐', '🙂', '😊', '🤩'] as const;
export const MOOD_LABELS = ['Rough', 'Meh', 'Okay', 'Good', 'Great'] as const;

export const HABIT_TEMPLATES = [
  { id: 'water', name: 'Drink water', icon: 'droplet' },
  { id: 'exercise', name: 'Exercise', icon: 'dumbbell' },
  { id: 'read', name: 'Read', icon: 'book' },
  { id: 'meditate', name: 'Meditate', icon: 'leaf' },
  { id: 'sleep', name: 'Sleep early', icon: 'moon' },
  { id: 'journal', name: 'Journal', icon: 'feather' },
  { id: 'walk', name: 'Walk', icon: 'walk' },
  { id: 'screen', name: 'Limit screens', icon: 'phone-off' },
  { id: 'cook', name: 'Cook at home', icon: 'chef' },
  { id: 'stretch', name: 'Stretch', icon: 'stretch' },
] as const;

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Today', icon: 'home', href: '/dashboard' },
  { id: 'checkin', label: 'Check-In', icon: 'check', href: '/checkin' },
  { id: 'mood', label: 'Mood Log', icon: 'heart', href: '/mood' },
  { id: 'insights', label: 'Insights', icon: 'chart', href: '/insights' },
  { id: 'badges', label: 'Badges', icon: 'award', href: '/badges' },
  { id: 'chat', label: 'Companion', icon: 'message', href: '/chat' },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
] as const;
