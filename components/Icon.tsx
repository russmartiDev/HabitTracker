import * as React from 'react';

export type IconName =
  | 'home' | 'check' | 'flame' | 'sparkles' | 'message' | 'chart' | 'award'
  | 'settings' | 'arrow-right' | 'arrow-left' | 'plus' | 'send' | 'edit'
  | 'lock' | 'heart' | 'leaf' | 'sun' | 'moon' | 'book' | 'droplet'
  | 'dumbbell' | 'feather' | 'walk' | 'phone-off' | 'chef' | 'stretch'
  | 'x' | 'chevron-down' | 'refresh' | 'trophy' | 'calendar' | 'target';

interface Props {
  name: IconName;
  size?: number;
  stroke?: number;
}

export function Icon({ name, size = 18, stroke = 1.6 }: Props) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { flexShrink: 0 },
  };
  switch (name) {
    case 'home': return <svg {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>;
    case 'check': return <svg {...p}><path d="M5 12l5 5L20 7"/></svg>;
    case 'flame': return <svg {...p}><path d="M12 2c2 4-2 5 0 9 1 2 3 2 3 5a5 5 0 0 1-10 0c0-3 2-4 2-7 2 2 4 1 5-2 0-2 0-3 0-5z"/></svg>;
    case 'sparkles': return <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
    case 'message': return <svg {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/></svg>;
    case 'chart': return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
    case 'award': return <svg {...p}><circle cx="12" cy="9" r="6"/><path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5"/></svg>;
    case 'settings': return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case 'arrow-left': return <svg {...p}><path d="M19 12H5M11 19l-7-7 7-7"/></svg>;
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'send': return <svg {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    case 'edit': return <svg {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
    case 'lock': return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case 'heart': return <svg {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1.1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>;
    case 'leaf': return <svg {...p}><path d="M11 20A7 7 0 0 1 4 13V4h9a7 7 0 1 1 0 14h-1z"/><path d="M2 22l8-8"/></svg>;
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case 'moon': return <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>;
    case 'book': return <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>;
    case 'droplet': return <svg {...p}><path d="M12 2.7l5.6 7.7a7 7 0 1 1-11.2 0z"/></svg>;
    case 'dumbbell': return <svg {...p}><path d="M6 4v16M2 8v8M10 8v8M14 8v8M22 8v8M18 4v16M10 12h4"/></svg>;
    case 'feather': return <svg {...p}><path d="M20.2 13.8L11 23H3v-8l9.2-9.2a4.5 4.5 0 0 1 8 8z"/><path d="M16 8L2 22M17.5 15H9"/></svg>;
    case 'walk': return <svg {...p}><circle cx="13" cy="4" r="2"/><path d="M7 22l3-7 3 4 4-2M11 9l3 2 3-1"/></svg>;
    case 'phone-off': return <svg {...p}><path d="M2 2l20 20M9 4h6M9 20h6M5 4v16"/></svg>;
    case 'chef': return <svg {...p}><path d="M6 14h12v6H6zM6 14a4 4 0 0 1-2-7.5A4 4 0 0 1 12 4a4 4 0 0 1 8 2.5A4 4 0 0 1 18 14"/></svg>;
    case 'stretch': return <svg {...p}><circle cx="12" cy="4" r="2"/><path d="M5 8l7 3 7-3M9 12l3 8M15 12l-3 8M5 14l4-2M19 14l-4-2"/></svg>;
    case 'x': return <svg {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case 'chevron-down': return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>;
    case 'refresh': return <svg {...p}><path d="M21 12a9 9 0 0 1-15.5 6.4L2 16M3 12a9 9 0 0 1 15.5-6.4L22 8M2 22v-6h6M22 2v6h-6"/></svg>;
    case 'trophy': return <svg {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 1 1-10 0z"/><path d="M17 5h3v3a3 3 0 0 1-3 3M7 5H4v3a3 3 0 0 0 3 3"/></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case 'target': return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>;
    default: return null;
  }
}
