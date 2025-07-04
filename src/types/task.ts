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
  isRoutine?: boolean;
  type: 'task' | 'habit';
  weekDays?: number[];
  routineName?: string;
  projectId?: string; // Link to project
  goalId?: string; // Link to long-term goal
  customCategory?: string; // Custom category name
  numericTarget?: number; // For habits - target number of completions
  unit?: string; // For habits - unit of measurement (e.g., "times", "glasses", "minutes")
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

// Export TaskType for backwards compatibility
export type TaskType = 'task' | 'habit';

// New flexible level progression system - easier early levels
export const LEVEL_XP_REQUIREMENTS = [
  0,    // Level 1
  50,   // Level 2 - easier
  120,  // Level 3 - easier
  220,  // Level 4 - easier
  350,  // Level 5 - easier
  520,  // Level 6 - easier
  730,  // Level 7 - easier
  980,  // Level 8 - easier
  1270, // Level 9 - easier
  1600, // Level 10 - easier
  2000, // Level 11
  2450, // Level 12
  2950, // Level 13
  3500, // Level 14
  4100, // Level 15
  4750, // Level 16
  5450, // Level 17
  6200, // Level 18
  7000, // Level 19
  7850  // Level 20
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
