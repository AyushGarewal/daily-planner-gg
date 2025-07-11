
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Heart, Smile, Meh, Frown, Angry } from 'lucide-react';
import { format } from 'date-fns';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cn } from '@/lib/utils';

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5 scale
  notes: string;
  tags: string[];
}

const MOOD_LEVELS = [
  { value: 5, label: 'Excellent', icon: Smile, color: 'text-green-500', bgColor: 'bg-green-100' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { value: 3, label: 'Okay', icon: Meh, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  { value: 2, label: 'Poor', icon: Frown, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  { value: 1, label: 'Terrible', icon: Angry, color: 'text-red-500', bgColor: 'bg-red-100' },
];

const MOOD_TAGS = [
  'Stressed', 'Relaxed', 'Anxious', 'Happy', 'Tired', 'Energetic',
  'Frustrated', 'Grateful', 'Lonely', 'Social', 'Productive', 'Overwhelmed'
];

export function MoodTracker() {
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('mood-entries', []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const dateString = selectedDate.toDateString();
  const existingEntry = moodEntries.find(entry => entry.date === dateString);

  const saveMoodEntry = () => {
    const entry: MoodEntry = {
      id: existingEntry?.id || crypto.randomUUID(),
      date: dateString,
      mood: currentMood,
      notes: notes.trim(),
      tags: selectedTags
    };

    setMoodEntries(prev => {
      if (existingEntry) {
        return prev.map(e => e.id === entry.id ? entry : e);
      } else {
        return [...prev, entry];
      }
    });

    // Reset form
    setNotes('');
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Load existing entry when date changes
  React.useEffect(() => {
    if (existingEntry) {
      setCurrentMood(existingEntry.mood);
      setNotes(existingEntry.notes || '');
      setSelectedTags(existingEntry.tags || []);
    } else {
      setCurrentMood(3);
      setNotes('');
      setSelectedTags([]);
    }
  }, [existingEntry]);

  const getAverageMood = () => {
    if (moodEntries.length === 0) return 0;
    return moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length;
  };

  const getCurrentMoodInfo = () => {
    return MOOD_LEVELS.find(level => level.value === currentMood) || MOOD_LEVELS[2];
  };

  const moodInfo = getCurrentMoodInfo();
  const IconComponent = moodInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Mood Tracker
        </CardTitle>
        <p className="text-sm text-muted-foreground">Track your daily mood and emotional well-being</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">How are you feeling?</label>
          <div className="grid grid-cols-5 gap-2">
            {MOOD_LEVELS.map((level) => {
              const Icon = level.icon;
              return (
                <button
                  key={level.value}
                  onClick={() => setCurrentMood(level.value)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all duration-200 text-center",
                    currentMood === level.value
                      ? `border-current ${level.bgColor} ${level.color}`
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Icon className={cn("h-6 w-6 mx-auto mb-1", level.color)} />
                  <div className="text-xs font-medium">{level.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Mood Display */}
        <div className={cn("p-4 rounded-lg", moodInfo.bgColor)}>
          <div className="flex items-center gap-3">
            <IconComponent className={cn("h-8 w-8", moodInfo.color)} />
            <div>
              <div className="font-semibold">Feeling {moodInfo.label}</div>
              <div className="text-sm text-muted-foreground">
                Selected for {format(selectedDate, "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        </div>

        {/* Mood Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Mood Tags (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm border transition-all duration-200",
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary hover:bg-secondary/80 border-secondary"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's on your mind? Any specific thoughts or events affecting your mood?"
            rows={3}
          />
        </div>

        {/* Save Button */}
        <Button onClick={saveMoodEntry} className="w-full">
          {existingEntry ? 'Update Mood Entry' : 'Save Mood Entry'}
        </Button>

        {/* Mood Statistics */}
        {moodEntries.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Mood Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {getAverageMood().toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Average Mood</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {moodEntries.length}
                </div>
                <div className="text-sm text-muted-foreground">Entries Logged</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Entries */}
        {moodEntries.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Recent Entries</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {moodEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((entry) => {
                  const entryMoodInfo = MOOD_LEVELS.find(l => l.value === entry.mood) || MOOD_LEVELS[2];
                  const EntryIcon = entryMoodInfo.icon;
                  return (
                    <div key={entry.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                      <EntryIcon className={cn("h-5 w-5", entryMoodInfo.color)} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{entryMoodInfo.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(entry.date), "MMM d, yyyy")}
                        </div>
                      </div>
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1">
                          {entry.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {entry.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
