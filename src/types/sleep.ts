
export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  bedtime: string; // HH:MM format
  wakeTime: string; // HH:MM format
  sleepDuration: number; // in hours
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
  createdAt: Date;
}

export interface SleepStats {
  averageSleepDuration: number;
  averageBedtime: string;
  averageWakeTime: string;
  sleepConsistency: number; // 0-100
  weeklyTrend: 'improving' | 'declining' | 'stable';
}
