
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'Career' | 'Personal' | 'Health' | 'Education' | 'Other';
  startDate: Date;
  targetDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalJournalEntry {
  id: string;
  goalId: string;
  content: string;
  mood: number; // 1-5 scale
  motivation: number; // 1-5 scale
  createdAt: Date;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Subtask {
  id: string;
  milestoneId: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface GoalProgress {
  goalId: string;
  totalSubtasks: number;
  completedSubtasks: number;
  percentage: number;
}
