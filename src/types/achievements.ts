
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  category: 'streak' | 'xp' | 'task' | 'habit' | 'level' | 'special';
  requirement: {
    type: 'streak' | 'xp' | 'task_completion' | 'habit_completion' | 'level' | 'daily_completion' | 'special';
    value: number;
    description: string;
  };
}

export interface SpinReward {
  id: string;
  title: string;
  type: 'xp' | 'power-up' | 'streak-shield' | 'xp-multiplier' | 'theme' | 'trophy' | 'quote';
  value: number | string;
  probability: number;
  description: string;
}

export interface UserStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  maxStreak: number;
  tasksCompleted: number;
  habitsCompleted: number;
  achievementsUnlocked: number;
  streakShieldsUsed: number;
  powerUpsUsed: number;
  dailyCompletionRate: number;
}

export interface PowerUp {
  id: string;
  type: 'auto-complete' | 'skip-token' | 'streak-shield' | 'xp-multiplier';
  name: string;
  description: string;
  quantity: number;
  usedToday?: boolean;
}

export interface CustomTrophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  dateAwarded: Date;
  category: 'personal' | 'achievement' | 'milestone' | 'custom';
}
