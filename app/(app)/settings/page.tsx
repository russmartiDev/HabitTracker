import { requireUser } from '@/lib/auth';
import { logoutAction } from '@/lib/actions/auth';
import { getActiveHabits } from '@/lib/habits';
import { SettingsProfileForm } from '@/components/SettingsProfileForm';
import { SettingsThemePicker } from '@/components/SettingsThemePicker';
import { ResetDataButton } from '@/components/ResetDataButton';

export default async function SettingsPage() {
  const user = await requireUser();
  const habits = getActiveHabits(user.id);

  return (
    <div className="rise" style={{ maxWidth: 720 }}>
      <h1 className="page-title" style={{ fontSize: 32, margin: '0 0 4px' }}>
        Your{' '}
        <span className="h-display" style={{ color: 'var(--accent-deep)' }}>
          profile
        </span>
        .
      </h1>
      <p className="lede">{user.email}</p>

      <section style={{ marginTop: 32, marginBottom: 40 }}>
        <div className="t-eyebrow" style={{ marginBottom: 16 }}>
          Profile
        </div>
        <SettingsProfileForm
          initialName={user.name}
          initialPref={user.communication_pref}
        />
        <p className="tiny faint" style={{ marginTop: 14 }}>
          Goal: {user.goal ?? '—'} · Active time: {user.active_time ?? '—'}
        </p>
      </section>

      <hr className="hr" />

      <section style={{ margin: '32px 0 40px' }}>
        <div className="t-eyebrow" style={{ marginBottom: 16 }}>
          Appearance
        </div>
        <SettingsThemePicker />
      </section>

      <hr className="hr" />

      <section style={{ margin: '32px 0 40px' }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>
          Habits in play
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
          Habit editing arrives in v2. For now, habits are set during onboarding.
        </p>
      </section>

      <hr className="hr" />

      <section style={{ margin: '32px 0 40px' }}>
        <form action={logoutAction}>
          <button className="btn btn-ghost" type="submit">
            Log out
          </button>
        </form>
      </section>

      <div
        className="card"
        style={{ borderColor: 'oklch(0.85 0.06 30)', background: 'transparent' }}
      >
        <div className="t-eyebrow" style={{ marginBottom: 8, color: 'var(--accent-deep)' }}>
          Danger zone
        </div>
        <p className="muted" style={{ margin: '0 0 14px', fontSize: 14 }}>
          Reset removes all check-ins, mood logs, badges, and chat history. Profile and
          habits stay.
        </p>
        <ResetDataButton />
      </div>
    </div>
  );
}
