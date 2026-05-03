-- 002_seed_badges.sql — seed the 15 badges
-- Idempotent via INSERT OR IGNORE.

INSERT OR IGNORE INTO badges (code, name, description) VALUES
  ('first_step',       'First Step',       'Complete your first check-in.'),
  ('week_warrior',     'Week Warrior',     'Reach a 7-day streak.'),
  ('monthly_master',   'Monthly Master',   '30 check-ins within any 30 days.'),
  ('comeback_kid',     'Comeback Kid',     'Resume after a 3+ day gap.'),
  ('mood_mapper',      'Mood Mapper',      'Log mood on 7 distinct days.'),
  ('honest_heart',     'Honest Heart',     'Share a tough day with a reflection.'),
  ('habit_hero',       'Habit Hero',       'Complete one habit 21 times.'),
  ('triple_threat',    'Triple Threat',    '3 habits done, 7 days running.'),
  ('reflective_soul',  'Reflective Soul',  'Write 5 reflections.'),
  ('conversationalist','Conversationalist','First chatbot conversation.'),
  ('early_bird',       'Early Bird',       'Check in before 9am, 5 times.'),
  ('night_owl',        'Night Owl',        'Check in after 9pm, 5 times.'),
  ('mood_rainbow',     'Mood Rainbow',     'Log all 5 mood levels in a month.'),
  ('deep_diver',       'Deep Diver',       'Write a 500+ character reflection.'),
  ('fortnight_force',  'Fortnight Force',  '14 check-ins within any 14 days.');
