import { requireUser } from '@/lib/auth';
import { logoutAction } from '@/lib/actions/auth';
import { resetUserDataAction } from '@/lib/actions/settings';
import { getActiveHabits } from '@/lib/habits';
import { SettingsProfileForm } from '@/components/SettingsProfileForm';
import { SettingsThemePicker } from '@/components/SettingsThemePicker';

export default async function SettingsPage() {
  const user = await requireUser();
  const habits = getActiveHabits(user.id);

  return (
    <div className="rise">
      <div className="page-header">
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>
            Settings
          </div>
          <h1 className="page-title">
            Your <span className="h-display" style={{ color: 'var(--accent-deep)' }}>profile</span>.
          </h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 720 }}>
        <div className="card">
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>
            Profile
          </div>
          <SettingsProfileForm
            initialName={user.name}
            initialPref={user.communication_pref}
          />
          <div className="tiny faint" style={{ marginTop: 16 }}>
            Email: {user.email} · Goal: {user.goal ?? '—'} · Active time:{' '}
            {user.active_time ?? '—'}
          </div>
        </div>

        <div className="card">
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>
            Appearance
          </div>
          <SettingsThemePicker />
        </div>

        <div className="card">
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>
            Habits
          </div>
          <div className="row wrap gap-6">
            {habits.length === 0 && <span className="tiny muted">No active habits.</span>}
            {habits.map((h) => (
              <span key={h.id} className="chip chip-active">
                {h.name}
              </span>
            ))}
          </div>
          <p className="tiny faint" style={{ marginTop: 12 }}>
            Habit editing UI lands in v2. For now, habits are set during onboarding.
          </p>
        </div>

        <div className="card">
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>
            Session
          </div>
          <form action={logoutAction}>
            <button className="btn btn-ghost" type="submit">
              Log out
            </button>
          </form>
        </div>

        <div className="card" style={{ borderColor: 'oklch(0.85 0.06 30)' }}>
          <div className="t-eyebrow" style={{ marginBottom: 8, color: 'var(--accent-deep)' }}>
            Danger zone
          </div>
          <p className="muted" style={{ margin: '0 0 14px', fontSize: 14 }}>
            Reset removes all check-ins, mood logs, badges, and chat history. Profile and
            habits stay.
          </p>
          <form action={resetUserDataAction}>
            <button
              className="btn btn-ghost"
              type="submit"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent-deep)' }}
            >
              Reset my data
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
