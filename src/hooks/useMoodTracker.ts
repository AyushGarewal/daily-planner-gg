
import { useLocalStorage } from './useLocalStorage';
import { MoodEntry, JournalEntry, TimeOfDay } from '../types/mood';

export function useMoodTracker() {
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('moodEntries', []);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);

  const addMoodEntry = (mood: number, energy: number, timeOfDay: TimeOfDay) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    // Check if entry already exists for this time of day
    const existingEntry = moodEntries.find(entry => 
      new Date(entry.date).toDateString() === todayStr && entry.timeOfDay === timeOfDay
    );

    if (existingEntry) {
      // Update existing entry
      setMoodEntries(prev => prev.map(entry => 
        entry.id === existingEntry.id 
          ? { ...entry, mood, energy }
          : entry
      ));
    } else {
      // Create new entry
      const newEntry: MoodEntry = {
        id: crypto.randomUUID(),
        date: today,
        timeOfDay,
        mood,
        energy,
      };
      setMoodEntries(prev => [...prev, newEntry]);
    }
  };

  const addJournalEntry = (wentWell: string, didntGoWell: string) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    // Check if entry already exists for today
    const existingEntry = journalEntries.find(entry => 
      new Date(entry.date).toDateString() === todayStr
    );

    if (existingEntry) {
      // Update existing entry
      setJournalEntries(prev => prev.map(entry => 
        entry.id === existingEntry.id 
          ? { ...entry, wentWell, didntGoWell }
          : entry
      ));
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: today,
        wentWell,
        didntGoWell,
      };
      setJournalEntries(prev => [...prev, newEntry]);
    }
  };

  const getTodaysMoodEntries = () => {
    const today = new Date().toDateString();
    return moodEntries.filter(entry => 
      new Date(entry.date).toDateString() === today
    );
  };

  const getTodaysJournalEntry = () => {
    const today = new Date().toDateString();
    return journalEntries.find(entry => 
      new Date(entry.date).toDateString() === today
    );
  };

  const getWeeklyMoodData = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return moodEntries.filter(entry => new Date(entry.date) >= weekAgo);
  };

  return {
    moodEntries,
    journalEntries,
    addMoodEntry,
    addJournalEntry,
    getTodaysMoodEntries,
    getTodaysJournalEntry,
    getWeeklyMoodData,
  };
}
