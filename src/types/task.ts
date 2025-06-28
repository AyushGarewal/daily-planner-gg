
export interface Task {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  dueDate: Date;
  priority: 'High' | 'Medium' | 'Low';
  recurrence: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  xpValue: number;
  category: string;
  completed: boolean;
  completedAt?: Date;
  taskType: 'normal' | 'surplus';
  failed?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  currentStreak: number;
  maxStreak: number;
  lastCompletionDate?: Date;
}

export interface DailyUsage {
  date: string;
  streakShield: boolean;
  autoComplete: boolean;
  skipToken: boolean;
  spinUsed: boolean;
}

export const CATEGORIES = [
  'Work',
  'Personal',
  'Health',
  'Learning',
  'Finance',
  'Social',
  'Household',
  'Other'
];

// New flexible level progression system
export const LEVEL_XP_REQUIREMENTS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  450,  // Level 4
  700,  // Level 5
  1000, // Level 6
  1350, // Level 7
  1750, // Level 8
  2200, // Level 9
  2700, // Level 10
  3250, // Level 11
  3850, // Level 12
  4500, // Level 13
  5200, // Level 14
  5950, // Level 15
  6750, // Level 16
  7600, // Level 17
  8500, // Level 18
  9450, // Level 19
  10450 // Level 20
];

export const getXPRequiredForLevel = (level: number): number => {
  if (level <= 1) return 0;
  if (level > LEVEL_XP_REQUIREMENTS.length) {
    // For levels beyond our predefined array, use exponential growth
    const baseXP = LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1];
    const extraLevels = level - LEVEL_XP_REQUIREMENTS.length;
    return baseXP + (extraLevels * 1000) + (extraLevels * extraLevels * 50);
  }
  return LEVEL_XP_REQUIREMENTS[level - 1];
};

export const getCurrentLevel = (totalXP: number): number => {
  for (let i = LEVEL_XP_REQUIREMENTS.length; i >= 1; i--) {
    if (totalXP >= LEVEL_XP_REQUIREMENTS[i - 1]) {
      return i;
    }
  }
  return 1;
};

export const getXPForCurrentLevel = (totalXP: number): number => {
  const currentLevel = getCurrentLevel(totalXP);
  return totalXP - getXPRequiredForLevel(currentLevel);
};

export const getXPForNextLevel = (totalXP: number): number => {
  const currentLevel = getCurrentLevel(totalXP);
  const nextLevelXP = getXPRequiredForLevel(currentLevel + 1);
  const currentLevelXP = getXPRequiredForLevel(currentLevel);
  return nextLevelXP - currentLevelXP;
};
