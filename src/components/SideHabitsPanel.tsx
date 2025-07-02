
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calendar, Star } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCustomCategories } from '../hooks/useCustomCategories';
import { useTasks } from '../hooks/useTasks';
import { WeekdaySelector } from './WeekdaySelector';
import { SubtaskManager } from './SubtaskManager';
import { SideHabit, SideHabitSubtask } from '../types/sideHabits';
import { getDay } from 'date-fns';

export function SideHabitsPanel() {
  const [sideHabits, setSideHabits] = useLocalStorage<SideHabit[]>('sideHabits', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('');
  const [newHabitXP, setNewHabitXP] = useState(5);
  const [newHabitRecurrence, setNewHabitRecurrence] = useState<'None' | 'Daily' | 'Weekly'>('None');
  const [newHabitWeekDays, setNewHabitWeekDays] = useState<number[]>([]);
  const [newHabitSubtasks, setNewHabitSubtasks] = useState<SideHabitSubtask[]>([]);
  
  const { categories } = useCustomCategories();
  const { addBonusXP } = useTasks();
  const today = new Date().toDateString();

  const addSideHabit = () => {
    if (newHabitName.trim() && newHabitCategory) {
      const newHabit: SideHabit = {
        id: `side_habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newHabitName.trim(),
        category: newHabitCategory,
        completedDates: [],
        recurrence: newHabitRecurrence,
        weekDays: newHabitRecurrence === 'Weekly' ? newHabitWeekDays : undefined,
        subtasks: newHabitSubtasks,
        xpValue: newHabitXP,
        createdAt: new Date()
      };
      setSideHabits(prev => [...prev, newHabit]);
      
      // Reset form
      setNewHabitName('');
      setNewHabitCategory('');
      setNewHabitXP(5);
      setNewHabitRecurrence('None');
      setNewHabitWeekDays([]);
      setNewHabitSubtasks([]);
      setIsFormOpen(false);
    }
  };

  const toggleHabitCompletion = (habitId: string) => {
    setSideHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(today);
        const updatedHabit = {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter(date => date !== today)
            : [...habit.completedDates, today]
        };
        
        // Add XP if completing for the first time today
        if (!isCompleted && habit.xpValue) {
          addBonusXP(habit.xpValue);
        }
        
        return updatedHabit;
      }
      return habit;
    }));
  };

  const toggleSubtask = (habitId: string, subtaskId: string) => {
    setSideHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const updatedSubtasks = habit.subtasks.map(subtask =>
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        return { ...habit, subtasks: updatedSubtasks };
      }
      return habit;
    }));
  };

  const deleteSideHabit = (habitId: string) => {
    setSideHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const shouldShowHabitToday = (habit: SideHabit) => {
    if (habit.recurrence === 'None') return true;
    if (habit.recurrence === 'Daily') return true;
    if (habit.recurrence === 'Weekly' && habit.weekDays) {
      const todayWeekday = getDay(new Date());
      return habit.weekDays.includes(todayWeekday);
    }
    return true;
  };

  const todaysHabits = sideHabits.filter(shouldShowHabitToday);

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
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                
                <div>
                  <Label htmlFor="habitCategory">Category</Label>
                  <Select value={newHabitCategory} onValueChange={setNewHabitCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={String(category)} value={String(category)}>
                          {String(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="habitXP">XP Reward</Label>
                  <Input
                    id="habitXP"
                    type="number"
                    value={newHabitXP}
                    onChange={(e) => setNewHabitXP(parseInt(e.target.value) || 5)}
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <Select value={newHabitRecurrence} onValueChange={(value: 'None' | 'Daily' | 'Weekly') => setNewHabitRecurrence(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newHabitRecurrence === 'Weekly' && (
                  <div>
                    <Label>Days of the Week</Label>
                    <WeekdaySelector
                      selectedDays={newHabitWeekDays}
                      onChange={setNewHabitWeekDays}
                    />
                  </div>
                )}

                <div>
                  <Label>Subtasks (Optional)</Label>
                  <SubtaskManager
                    subtasks={newHabitSubtasks}
                    onSubtaskToggle={() => {}}
                    isMainTaskCompleted={false}
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
          Track habits and earn XP without affecting streaks
        </p>
      </CardHeader>
      <CardContent>
        {todaysHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No side habits for today.</p>
            <p className="text-xs">Add habits to track and earn XP.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysHabits.map((habit) => {
              const isCompleted = habit.completedDates.includes(today);
              const allSubtasksCompleted = habit.subtasks.length === 0 || habit.subtasks.every(st => st.completed);
              
              return (
                <div key={habit.id} className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => toggleHabitCompletion(habit.id)}
                      />
                      <div>
                        <span className={`${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {habit.name}
                        </span>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{habit.category}</span>
                          {habit.recurrence !== 'None' && (
                            <>
                              <Calendar className="h-3 w-3" />
                              <span>{habit.recurrence}</span>
                            </>
                          )}
                          {habit.xpValue && (
                            <>
                              <Star className="h-3 w-3" />
                              <span>+{habit.xpValue} XP</span>
                            </>
                          )}
                        </div>
                      </div>
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
                  
                  {habit.subtasks.length > 0 && (
                    <div className="ml-6 space-y-2">
                      {habit.subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={() => toggleSubtask(habit.id, subtask.id)}
                          />
                          <span className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
