/* Seeds 3 demo users:
 *   demo-fresh@lichen.local — Day 1, no check-ins
 *   demo-mid@lichen.local   — 12 days of varied check-ins
 *   demo-power@lichen.local — 60 days, high level, several badges
 *
 * Idempotent: re-running re-seeds (drops + re-inserts) demo users only.
 */

import argon2 from 'argon2';
import { getDb, closeDb } from '@/lib/db';
import { localDateString, shiftDate } from '@/lib/dates';
import type { HabitRow } from '@/lib/types';

async function hash(p: string) {
  return argon2.hash(p, { type: argon2.argon2id });
}

interface SeedSpec {
  email: string;
  name: string;
  password: string;
  goal: string;
  active_time: string;
  habits: { name: string }[];
  days: number; // 0 → fresh
}

const SPECS: SeedSpec[] = [
  {
    email: 'demo-fresh@lichen.local',
    name: 'Demo Fresh',
    password: 'demo',
    goal: 'health',
    active_time: 'morning',
    habits: [],
    days: 0,
  },
  {
    email: 'demo-mid@lichen.local',
    name: 'Demo Mid',
    password: 'demo',
    goal: 'productivity',
    active_time: 'morning',
    habits: [{ name: 'Drink water' }, { name: 'Read' }, { name: 'Walk' }],
    days: 12,
  },
  {
    email: 'demo-power@lichen.local',
    name: 'Demo Power',
    password: 'demo',
    goal: 'mental_wellness',
    active_time: 'evening',
    habits: [
      { name: 'Meditate' },
      { name: 'Exercise' },
      { name: 'Journal' },
      { name: 'Sleep early' },
    ],
    days: 60,
  },
];

function seededRand(seed: number) {
  // tiny LCG so generated history is reproducible
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

async function run() {
  const db = getDb();

  for (const spec of SPECS) {
    // wipe any prior demo data for this email
    db.prepare('DELETE FROM users WHERE email = ?').run(spec.email);

    const password_hash = await hash(spec.password);
    const aiDay = spec.email.length % 7;
    const created = Date.now() - (spec.days + 1) * 86400000;

    const userInfo = db
      .prepare(
        `INSERT INTO users (email, password_hash, name, communication_pref, goal, active_time, onboarding_completed, ai_day, created_at)
         VALUES (?, ?, ?, 'encouraging', ?, ?, ?, ?, ?)`,
      )
      .run(
        spec.email,
        password_hash,
        spec.name,
        spec.goal,
        spec.active_time,
        spec.days > 0 || spec.email.includes('fresh') ? (spec.days > 0 ? 1 : 0) : 0,
        aiDay,
        created,
      );

    const userId = Number(userInfo.lastInsertRowid);

    // habits
    const habitIds: number[] = [];
    for (const h of spec.habits) {
      const r = db
        .prepare(
          `INSERT INTO habits (user_id, name, type, archived, created_at) VALUES (?, ?, 'binary', 0, ?)`,
        )
        .run(userId, h.name, created);
      habitIds.push(Number(r.lastInsertRowid));
    }

    // check-ins back-fill
    if (spec.days > 0 && habitIds.length > 0) {
      const rng = seededRand(userId);
      const today = localDateString();
      for (let d = spec.days - 1; d >= 0; d--) {
        const date = shiftDate(today, -d);
        const mood = (1 + Math.floor(rng() * 5)) as 1 | 2 | 3 | 4 | 5;
        const reflection =
          rng() > 0.4 ? null : 'Nothing fancy. Just kept going.';
        const xpEarned = 10 + 5 + (reflection ? 3 : 0) + 2;

        const ci = db
          .prepare(
            `INSERT INTO check_ins (user_id, date, mood, reflection, xp_earned, ai_path, ai_message, created_at)
             VALUES (?, ?, ?, ?, ?, 'algorithmic', NULL, ?)`,
          )
          .run(
            userId,
            date,
            mood,
            reflection,
            xpEarned,
            new Date(`${date}T20:00:00`).getTime(),
          );
        const ciId = Number(ci.lastInsertRowid);

        for (const hid of habitIds) {
          const r = rng();
          const status = r < 0.7 ? 'yes' : r < 0.9 ? 'partial' : 'no';
          db.prepare(
            `INSERT INTO habit_logs (check_in_id, habit_id, status) VALUES (?, ?, ?)`,
          ).run(ciId, hid, status);
        }
      }

      // first_step badge (and a couple more for power)
      db.prepare(
        `INSERT OR IGNORE INTO user_badges (user_id, badge_code, earned_at) VALUES (?, 'first_step', ?)`,
      ).run(userId, created + 86400000);
      if (spec.days >= 7) {
        db.prepare(
          `INSERT OR IGNORE INTO user_badges (user_id, badge_code, earned_at) VALUES (?, 'week_warrior', ?)`,
        ).run(userId, created + 7 * 86400000);
      }
      if (spec.days >= 30) {
        db.prepare(
          `INSERT OR IGNORE INTO user_badges (user_id, badge_code, earned_at) VALUES (?, 'monthly_master', ?)`,
        ).run(userId, created + 30 * 86400000);
        db.prepare(
          `INSERT OR IGNORE INTO user_badges (user_id, badge_code, earned_at) VALUES (?, 'reflective_soul', ?)`,
        ).run(userId, created + 14 * 86400000);
      }
    }

    console.log(
      `[seed] ${spec.email} — id=${userId}, days=${spec.days}, habits=${habitIds.length}`,
    );
  }

  closeDb();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
