import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getCheckInHabits } from '@/lib/habits';
import { getTodayCheckIn } from '@/lib/stats';
import { CheckInForm } from '@/components/CheckInForm';

export default async function CheckInPage() {
  const user = await requireUser();
  if (!user.onboarding_completed) redirect('/onboarding');

  const today = getTodayCheckIn(user.id);
  if (today) {
    return (
      <div className="rise" style={{ maxWidth: 540, margin: '0 auto', paddingTop: 64 }}>
        <div className="onboard-card">
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>
            Already checked in
          </div>
          <h2 style={{ fontSize: 26, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>
            You&rsquo;ve checked in today.
          </h2>
          <p className="muted" style={{ marginTop: 12, marginBottom: 24 }}>
            Come back tomorrow. (One per local day.)
          </p>
          <Link href="/dashboard" className="btn btn-primary btn-block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const habits = getCheckInHabits(user.id, 3);
  return <CheckInForm habits={habits.map((h) => ({ id: h.id, name: h.name }))} />;
}
