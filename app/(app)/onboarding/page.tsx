import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { OnboardingFlow } from '@/components/OnboardingFlow';

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboarding_completed) redirect('/dashboard');
  return (
    <div className="onboard-stage">
      <OnboardingFlow userName={user.name} />
    </div>
  );
}
