// Shared domain types.

export type CommunicationPref = 'encouraging' | 'direct' | 'playful';
export type Goal = 'health' | 'productivity' | 'mental_wellness' | 'learning' | 'relationships';
export type ActiveTime = 'morning' | 'afternoon' | 'evening' | 'night';
export type HabitStatus = 'yes' | 'no' | 'partial';
export type AiPath = 'algorithmic' | 'ai';

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  communication_pref: CommunicationPref;
  goal: Goal | null;
  active_time: ActiveTime | null;
  onboarding_completed: 0 | 1;
  ai_day: number;
  created_at: number;
}

export interface HabitRow {
  id: number;
  user_id: number;
  name: string;
  type: 'binary' | 'duration' | 'count';
  archived: 0 | 1;
  created_at: number;
}

export interface CheckInRow {
  id: number;
  user_id: number;
  date: string; // YYYY-MM-DD
  mood: 1 | 2 | 3 | 4 | 5;
  reflection: string | null;
  xp_earned: number;
  ai_path: AiPath;
  ai_message: string | null;
  created_at: number;
}

export interface HabitLogRow {
  id: number;
  check_in_id: number;
  habit_id: number;
  status: HabitStatus;
  difficulty: 'easy' | 'okay' | 'hard' | null;
  minutes: number | null;
  note: string | null;
}

export interface MoodLogRow {
  id: number;
  user_id: number;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string | null;
  note: string | null;
  logged_at: number;
}

export interface ChatMessageRow {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
}

export interface BadgeRow {
  code: string;
  name: string;
  description: string;
}

export interface UserBadgeRow {
  user_id: number;
  badge_code: string;
  earned_at: number;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  daysActive: number;
  lastCheckInDate: string | null;
}
