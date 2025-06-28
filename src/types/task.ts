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

export const XP_PER_LEVEL = 1000;
