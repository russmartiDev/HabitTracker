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
    <div className="rise">
      <div className="page-wash">
        <div className="page-wash-inner">
          <div className="page-header">
            <div>
              <div className="notation-tag" style={{ marginBottom: 14 }}>
                SETTINGS
              </div>
              <h1 className="page-title">Your profile.</h1>
              <p className="page-subtitle">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="page-body-inner" style={{ maxWidth: 720 }}>
      <section style={{ marginBottom: 40 }}>
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
        style={{ borderColor: 'var(--error)', background: 'var(--error-soft)' }}
      >
        <div className="t-eyebrow" style={{ marginBottom: 8, color: 'var(--error)' }}>
          Danger zone
        </div>
        <p className="muted" style={{ margin: '0 0 14px', fontSize: 14 }}>
          Reset removes all check-ins, mood logs, badges, and chat history. Profile and
          habits stay.
        </p>
        <ResetDataButton />
      </div>
        </div>
      </div>
    </div>
  );
}
