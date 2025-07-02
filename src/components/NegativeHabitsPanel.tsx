
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Shield } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTasks } from '../hooks/useTasks';

interface NegativeHabit {
  id: string;
  name: string;
  xpValue: number;
  avoidedDates: string[];
}

export function NegativeHabitsPanel() {
  const [negativeHabits, setNegativeHabits] = useLocalStorage<NegativeHabit[]>('negativeHabits', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitXP, setNewHabitXP] = useState(10);
  const { addBonusXP } = useTasks();

  const today = new Date().toDateString();

  const addNegativeHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: NegativeHabit = {
        id: `negative_habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newHabitName.trim(),
        xpValue: newHabitXP,
        avoidedDates: []
      };
      setNegativeHabits(prev => [...prev, newHabit]);
      setNewHabitName('');
      setNewHabitXP(10);
      setIsFormOpen(false);
    }
  };

  const toggleHabitAvoidance = (habitId: string) => {
    setNegativeHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isAvoided = habit.avoidedDates.includes(today);
        const updatedHabit = {
          ...habit,
          avoidedDates: isAvoided
            ? habit.avoidedDates.filter(date => date !== today)
            : [...habit.avoidedDates, today]
        };
        
        // Add XP if avoiding the habit for the first time today
        if (!isAvoided) {
          addBonusXP(habit.xpValue);
        }
        
        return updatedHabit;
      }
      return habit;
    }));
  };

  const deleteNegativeHabit = (habitId: string) => {
    setNegativeHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Negative Habits
          </CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Negative Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Negative Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="habitName">Habit Name</Label>
                  <Input
                    id="habitName"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="Enter habit to avoid..."
                  />
                </div>
                <div>
                  <Label htmlFor="habitXP">XP for Avoiding</Label>
                  <Input
                    id="habitXP"
                    type="number"
                    value={newHabitXP}
                    onChange={(e) => setNewHabitXP(parseInt(e.target.value) || 10)}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addNegativeHabit} className="flex-1">
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
          Habits to avoid - gain XP for successfully avoiding them
        </p>
      </CardHeader>
      <CardContent>
        {negativeHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No negative habits yet.</p>
            <p className="text-xs">Add habits you want to avoid and gain XP for not doing them.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {negativeHabits.map((habit) => {
              const isAvoided = habit.avoidedDates.includes(today);
              return (
                <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isAvoided}
                      onCheckedChange={() => toggleHabitAvoidance(habit.id)}
                    />
                    <div>
                      <span className={`${isAvoided ? 'text-green-600' : ''}`}>
                        {habit.name}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        +{habit.xpValue} XP for avoiding
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNegativeHabit(habit.id)}
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
