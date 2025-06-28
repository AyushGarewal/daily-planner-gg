
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (data: any) => boolean;
  unlocked: boolean;
  unlockedAt?: Date;
  isCustom?: boolean;
  xpReward?: number;
}

export interface PowerUp {
  id: string;
  title: string;
  description: string;
  icon: string;
  uses: number;
  maxUses: number;
  type: 'auto-complete' | 'double-xp' | 'streak-shield' | 'skip-token' | 'xp-multiplier';
}

export interface SpinReward {
  id: string;
  title: string;
  type: 'xp' | 'power-up' | 'streak-shield' | 'theme' | 'trophy' | 'quote';
  value: number | string;
  probability: number;
  description?: string;
}

export interface UserStats {
  achievements: Achievement[];
  powerUps: PowerUp[];
  streakShields: number;
  totalTasksCompleted: number;
  earlyBirdCount: number;
  lastSpinDate?: Date;
  theme: string;
  dailyUsage: DailyUsage[];
  unlockedThemes: string[];
  motivationQuotes: string[];
}

export interface DailyUsage {
  date: string;
  streakShield: boolean;
  autoComplete: boolean;
  skipToken: boolean;
  spinUsed: boolean;
}

export interface CustomTrophyCondition {
  type: 'streak' | 'tasks_completed' | 'early_bird' | 'level_reached' | 'category_tasks' | 'xp_gained';
  value: number;
  category?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export interface CustomTrophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: CustomTrophyCondition;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
}
