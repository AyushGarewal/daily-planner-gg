
export interface Routine {
  id: string;
  name: string;
  description?: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  habits: RoutineHabit[];
  active: boolean;
  daysOfWeek: number[]; // 0-6, Sunday = 0
  createdAt: Date;
}

export interface RoutineHabit {
  id: string;
  title: string;
  description?: string;
  xpValue: number;
  category: string;
  estimatedDuration: number; // in minutes
  order: number;
}
