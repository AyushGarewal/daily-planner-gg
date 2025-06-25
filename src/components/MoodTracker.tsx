
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Zap, Sun, Sunset, Moon } from 'lucide-react';
import { useMoodTracker } from '../hooks/useMoodTracker';
import { TimeOfDay } from '../types/mood';

export function MoodTracker() {
  const { addMoodEntry, getTodaysMoodEntries } = useMoodTracker();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>('morning');
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);

  const todaysEntries = getTodaysMoodEntries();

  const timeOptions = [
    { value: 'morning' as TimeOfDay, label: 'Morning', icon: Sun },
    { value: 'evening' as TimeOfDay, label: 'Evening', icon: Sunset },
    { value: 'night' as TimeOfDay, label: 'Night', icon: Moon },
  ];

  const handleSubmit = () => {
    addMoodEntry(mood, energy, selectedTime);
    setIsOpen(false);
    setMood(3);
    setEnergy(3);
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'bg-red-500';
    if (rating === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Mood & Energy Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {timeOptions.map(({ value, label, icon: Icon }) => {
              const entry = todaysEntries.find(e => e.timeOfDay === value);
              return (
                <div key={value} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                  {entry ? (
                    <div className="space-y-1">
                      <Badge className={`${getRatingColor(entry.mood)} text-white text-xs`}>
                        Mood: {entry.mood}
                      </Badge>
                      <Badge className={`${getRatingColor(entry.energy)} text-white text-xs`}>
                        Energy: {entry.energy}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Not recorded</div>
                  )}
                </div>
              );
            })}
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Record Mood & Energy</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How are you feeling?</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Time of Day</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={selectedTime === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(value)}
                        className="flex items-center gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Mood (1-5): {mood}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Button
                        key={rating}
                        variant={mood === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMood(rating)}
                        className="w-10 h-10 p-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Energy (1-5): {energy}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Button
                        key={rating}
                        variant={energy === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEnergy(rating)}
                        className="w-10 h-10 p-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Save Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
