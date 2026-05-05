// Shared display primitives ported from Design/components.jsx.

export function FlameStamp({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size}>
      <path
        d="M28 6 C 33 14, 25 18, 30 26 C 34 22, 40 28, 40 36 C 40 44, 34 50, 28 50 C 22 50, 16 44, 16 36 C 16 30, 19 28, 21 26 C 22 30, 25 28, 25 24 C 28 26, 30 22, 28 16 C 28 12, 28 8, 28 6 Z"
        fill="rgb(255,218,68)"
        stroke="rgb(15,23,42)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M24 32 C 24 28, 28 28, 30 30 C 32 32, 32 38, 28 42 C 24 38, 24 35, 24 32 Z"
        fill="rgb(216,0,39)"
      />
    </svg>
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
  color = 'rgb(123,97,255)',
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
