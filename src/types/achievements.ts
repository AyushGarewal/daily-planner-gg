
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  unlocked?: boolean; // For backward compatibility
  category: 'streak' | 'xp' | 'task' | 'habit' | 'level' | 'special';
  requirement: {
    type: 'streak' | 'xp' | 'task_completion' | 'habit_completion' | 'level' | 'daily_completion' | 'special';
    value: number;
    description: string;
  };
  xpReward?: number;
  isCustom?: boolean;
  condition?: (data: any) => boolean; // Add condition function for backwards compatibility
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  progress: number;
  completed: boolean;
  xpReward: number;
  badgeIcon: string;
  conditions: Array<{
    type: 'completion_percentage' | 'task_count' | 'streak_days' | 'category_focus';
    target: number;
  }>;
}

export interface CustomTrophyCondition {
  type: 'streak' | 'tasks_completed' | 'early_bird' | 'level_reached' | 'category_tasks' | 'xp_gained' | 'completion_time';
  value: number;
  operator?: 'gte' | 'lte' | 'eq';
  timeframe?: 'all_time' | 'daily' | 'weekly' | 'monthly';
  category?: string;
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
  totalTasksCompleted: number; // Add this property
  habitsCompleted: number;
  achievementsUnlocked: number;
  streakShieldsUsed: number;
  powerUpsUsed: number;
  dailyCompletionRate: number;
  achievements: Achievement[];
  streakShields: number;
  powerUps: PowerUp[];
  theme: string; // Add theme property
  lastSpinDate?: Date; // Add lastSpinDate property
  earlyBirdCount: number; // Add earlyBirdCount property
}

export interface PowerUp {
  id: string;
  type: 'auto-complete' | 'skip-token' | 'streak-shield' | 'xp-multiplier';
  name: string;
  title: string;
  description: string;
  quantity: number;
  uses: number;
  maxUses: number; // Add maxUses property
  usedToday?: boolean;
  icon: string;
}

export interface DailyUsage {
  autoComplete: boolean;
  skipToken: boolean;
  streakShield: boolean;
  spinUsed: boolean;  // Changed from xpMultiplier to spinUsed to match usage
}

export interface CustomTrophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  dateAwarded?: Date;
  category?: 'personal' | 'achievement' | 'milestone' | 'custom';
  conditions: CustomTrophyCondition[];
  xpReward: number;
  requiresAll?: boolean;
  unlocked: boolean;
  unlockedAt?: Date;
}
