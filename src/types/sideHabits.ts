
export interface SideHabit {
  id: string;
  name: string;
  category: string;
  completedDates: string[];
  recurrence: 'None' | 'Daily' | 'Weekly';
  weekDays?: number[]; // 0-6, Sunday = 0
  subtasks: SideHabitSubtask[];
  createdAt: Date;
}

export interface SideHabitSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface NegativeHabit {
  id: string;
  name: string;
  category: string;
  xpValue: number;
  xpPenalty: number;
  avoidedDates: string[];
  failedDates: string[];
  recurrence: 'None' | 'Daily' | 'Weekly';
  weekDays?: number[];
  subtasks: NegativeHabitSubtask[];
  createdAt: Date;
}

export interface NegativeHabitSubtask {
  id: string;
  title: string;
  completed: boolean;
}
