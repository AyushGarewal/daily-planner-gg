
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SideHabit {
  id: string;
  name: string;
  completedDates: string[];
}

export function SideHabitsPanel() {
  const [sideHabits, setSideHabits] = useLocalStorage<SideHabit[]>('sideHabits', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const today = new Date().toDateString();

  const addSideHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: SideHabit = {
        id: `side_habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newHabitName.trim(),
        completedDates: []
      };
      setSideHabits(prev => [...prev, newHabit]);
      setNewHabitName('');
      setIsFormOpen(false);
    }
  };

  const toggleHabitCompletion = (habitId: string) => {
    setSideHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter(date => date !== today)
            : [...habit.completedDates, today]
        };
      }
      return habit;
    }));
  };

  const deleteSideHabit = (habitId: string) => {
    setSideHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Side Habits</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Side Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Side Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="habitName">Habit Name</Label>
                  <Input
                    id="habitName"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="Enter habit name..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addSideHabit} className="flex-1">
                    Add Habit
                  </Button>
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">
          Track habits without affecting streaks or XP
        </p>
      </CardHeader>
      <CardContent>
        {sideHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No side habits yet.</p>
            <p className="text-xs">Add habits to track without affecting your main progress.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sideHabits.map((habit) => {
              const isCompleted = habit.completedDates.includes(today);
              return (
                <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleHabitCompletion(habit.id)}
                    />
                    <span className={`${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {habit.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSideHabit(habit.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
