import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import dynamic from 'next/dynamic';
import { getCurrentUser } from '@/lib/auth';
import { getUserStats } from '@/lib/stats';
import { Sidebar } from '@/components/Sidebar';
import { ThemeApplier } from '@/components/ThemeApplier';

// Dev-only tweaks panel. In production, NODE_ENV is statically replaced and
// SWC dead-code-eliminates the dynamic import entirely — the TweaksPanel
// module is not bundled.
const DevTweaksMount =
  process.env.NODE_ENV === 'production'
    ? null
    : dynamic(() =>
        import('@/components/TweaksPanel').then((m) => ({ default: m.TweaksPanel })),
      );

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const hdrs = await headers();
  const pathname = hdrs.get('x-pathname') ?? '';

  // Onboarding gate — bounce to /onboarding unless completed (or already there).
  if (!user.onboarding_completed && !pathname.startsWith('/onboarding')) {
    redirect('/onboarding');
  }
  if (user.onboarding_completed && pathname === '/onboarding') {
    redirect('/dashboard');
  }

  const stats = getUserStats(user.id);

  return (
    <>
      <ThemeApplier />
      <div className="app-shell">
        <Sidebar
          user={{
            name: user.name,
            level: stats.level,
            streak: stats.currentStreak,
            xp: stats.xpInLevel,
            xpForNext: stats.xpForNextLevel,
          }}
        />
        <main className="main">{children}</main>
      </div>
      {DevTweaksMount && <DevTweaksMount />}
    </>
  );
}
