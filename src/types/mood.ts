
export interface MoodEntry {
  id: string;
  date: Date;
  timeOfDay: 'morning' | 'evening' | 'night';
  mood: number; // 1-5 scale
  energy: number; // 1-5 scale
}

export interface JournalEntry {
  id: string;
  date: Date;
  wentWell: string;
  didntGoWell: string;
}

export type TimeOfDay = 'morning' | 'evening' | 'night';
