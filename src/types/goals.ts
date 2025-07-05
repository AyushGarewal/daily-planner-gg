
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
  // Link to habit progress instead of separate numeric target
  linkedTaskIds?: string[];
  linkedHabitIds?: string[];
  // New: Habit targets for dual progress system
  habitTargets?: { [habitId: string]: number }; // habitId -> target completion count
  milestones: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  title: string;
  description?: string;
  percentageTarget: number; // 0-100
  dueDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
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
  // New: Dual progress tracking
  habitProgress?: {
    current: number;
    target: number;
    percentage: number;
  };
  milestoneProgress?: {
    completedMilestones: number;
    totalMilestones: number;
    percentage: number;
  };
}
