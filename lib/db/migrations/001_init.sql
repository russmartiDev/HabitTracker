-- 001_init.sql — initial schema for lichen
-- All timestamps stored as integer epoch milliseconds (Date.now()).
-- check_ins.date is YYYY-MM-DD in user-local timezone at submit time.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  communication_pref TEXT NOT NULL DEFAULT 'encouraging' CHECK (communication_pref IN ('encouraging','direct','playful')),
  goal TEXT CHECK (goal IS NULL OR goal IN ('health','productivity','mental_wellness','learning','relationships')),
  active_time TEXT CHECK (active_time IS NULL OR active_time IN ('morning','afternoon','evening','night')),
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  ai_day INTEGER NOT NULL DEFAULT 0, -- 0..6 (Sun..Sat) — fixed at user creation
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'binary' CHECK (type IN ('binary','duration','count')),
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS habits_user_idx ON habits(user_id, archived);

CREATE TABLE IF NOT EXISTS check_ins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  reflection TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  ai_path TEXT NOT NULL DEFAULT 'algorithmic' CHECK (ai_path IN ('algorithmic','ai')),
  ai_message TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS check_ins_user_date_idx ON check_ins(user_id, date DESC);

CREATE TABLE IF NOT EXISTS habit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  check_in_id INTEGER NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('yes','no','partial')),
  difficulty TEXT CHECK (difficulty IS NULL OR difficulty IN ('easy','okay','hard')),
  minutes INTEGER,
  note TEXT
);
CREATE INDEX IF NOT EXISTS habit_logs_checkin_idx ON habit_logs(check_in_id);
CREATE INDEX IF NOT EXISTS habit_logs_habit_idx ON habit_logs(habit_id);

CREATE TABLE IF NOT EXISTS mood_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  tags TEXT, -- JSON array of strings
  note TEXT,
  logged_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS mood_logs_user_idx ON mood_logs(user_id, logged_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS chat_messages_user_idx ON chat_messages(user_id, created_at);

CREATE TABLE IF NOT EXISTS badges (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL REFERENCES badges(code),
  earned_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, badge_code)
);
