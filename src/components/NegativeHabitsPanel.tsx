
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Shield, Calendar } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCustomCategories } from '../hooks/useCustomCategories';
import { useTasks } from '../hooks/useTasks';
import { WeekdaySelector } from './WeekdaySelector';
import { SubtaskManager } from './SubtaskManager';
import { NegativeHabit, NegativeHabitSubtask } from '../types/sideHabits';
import { CATEGORIES } from '../types/task';
import { getDay } from 'date-fns';

export function NegativeHabitsPanel() {
  const [negativeHabits, setNegativeHabits] = useLocalStorage<NegativeHabit[]>('negativeHabits', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('');
  const [newHabitXP, setNewHabitXP] = useState(10);
  const [newHabitPenalty, setNewHabitPenalty] = useState(5);
  const [newHabitRecurrence, setNewHabitRecurrence] = useState<'None' | 'Daily' | 'Weekly'>('None');
  const [newHabitWeekDays, setNewHabitWeekDays] = useState<number[]>([]);
  const [newHabitSubtasks, setNewHabitSubtasks] = useState<NegativeHabitSubtask[]>([]);
  
  const { categories: customCategories } = useCustomCategories();
  const { addBonusXP, progress, setProgress } = useTasks();
  const today = new Date().toDateString();

  // Combine default and custom categories
  const allCategories = [...CATEGORIES, ...customCategories];

  const addNegativeHabit = () => {
    console.log('Adding negative habit:', { newHabitName, newHabitCategory });
    
    if (!newHabitName.trim()) {
      console.log('Habit name is empty');
      return;
    }
    
    if (!newHabitCategory) {
      console.log('Category not selected');
      return;
    }

    const validSubtasks = newHabitSubtasks.filter(st => st.title.trim());
    
    const newHabit: NegativeHabit = {
      id: `negative_habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newHabitName.trim(),
      category: newHabitCategory,
      xpValue: newHabitXP,
      xpPenalty: newHabitPenalty,
      avoidedDates: [],
      failedDates: [],
      recurrence: newHabitRecurrence,
      weekDays: newHabitRecurrence === 'Weekly' ? newHabitWeekDays : undefined,
      subtasks: validSubtasks,
      createdAt: new Date()
    };
    
    console.log('Created new negative habit:', newHabit);
    
    setNegativeHabits(prev => {
      const updated = [...prev, newHabit];
      console.log('Updated negative habits:', updated);
      return updated;
    });
    
    // Reset form
    setNewHabitName('');
    setNewHabitCategory('');
    setNewHabitXP(10);
    setNewHabitPenalty(5);
    setNewHabitRecurrence('None');
    setNewHabitWeekDays([]);
    setNewHabitSubtasks([]);
    setIsFormOpen(false);
    
    console.log('Form reset and closed');
  };

  const toggleHabitAvoidance = (habitId: string) => {
    setNegativeHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isAvoided = habit.avoidedDates.includes(today);
        const updatedHabit = {
          ...habit,
          avoidedDates: isAvoided
            ? habit.avoidedDates.filter(date => date !== today)
            : [...habit.avoidedDates, today],
          failedDates: isAvoided
            ? habit.failedDates
            : habit.failedDates.filter(date => date !== today)
        };
        
        // Add XP if avoiding the habit for the first time today
        if (!isAvoided) {
          let xpToAdd = habit.xpValue;
          
          if (habit.subtasks.length > 0) {
            const completedSubtasks = habit.subtasks.filter(st => st.completed).length;
            const completionPercentage = completedSubtasks / habit.subtasks.length;
            xpToAdd = Math.round(habit.xpValue * completionPercentage);
          }
          
          if (xpToAdd > 0) {
            console.log(`Adding ${xpToAdd} XP for avoiding negative habit: ${habit.name}`);
            addBonusXP(xpToAdd);
            
            // Update progress stats directly
            setProgress(prevProgress => ({
              ...prevProgress,
              totalXP: prevProgress.totalXP + xpToAdd,
              level: Math.floor((prevProgress.totalXP + xpToAdd) / 100) + 1
            }));
          }
        }
        
        return updatedHabit;
      }
      return habit;
    }));
  };

  const markHabitFailed = (habitId: string) => {
    setNegativeHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const hasFailed = habit.failedDates.includes(today);
        const updatedHabit = {
          ...habit,
          failedDates: hasFailed
            ? habit.failedDates.filter(date => date !== today)
            : [...habit.failedDates, today],
          avoidedDates: hasFailed
            ? habit.avoidedDates
            : habit.avoidedDates.filter(date => date !== today)
        };
        
        // Apply XP penalty if failed for the first time today
        if (!hasFailed) {
          console.log(`Removing ${habit.xpPenalty} XP for failing negative habit: ${habit.name}`);
          addBonusXP(-habit.xpPenalty);
          
          // Update progress stats directly
          setProgress(prevProgress => ({
            ...prevProgress,
            totalXP: Math.max(0, prevProgress.totalXP - habit.xpPenalty),
            level: Math.floor(Math.max(0, prevProgress.totalXP - habit.xpPenalty) / 100) + 1
          }));
        }
        
        return updatedHabit;
      }
      return habit;
    }));
  };

  const toggleSubtask = (habitId: string, subtaskId: string) => {
    setNegativeHabits(prev => prev.map(habit => {
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

  const deleteNegativeHabit = (habitId: string) => {
    setNegativeHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const shouldShowHabitToday = (habit: NegativeHabit) => {
    if (habit.recurrence === 'None') return true;
    if (habit.recurrence === 'Daily') return true;
    if (habit.recurrence === 'Weekly' && habit.weekDays) {
      const todayWeekday = getDay(new Date());
      return habit.weekDays.includes(todayWeekday);
    }
    return true;
  };

  const addNewSubtask = () => {
    const newSubtask: NegativeHabitSubtask = {
      id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      completed: false
    };
    setNewHabitSubtasks(prev => [...prev, newSubtask]);
  };

  const updateSubtask = (subtaskId: string, title: string) => {
    setNewHabitSubtasks(prev => prev.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, title } : subtask
    ));
  };

  const removeSubtask = (subtaskId: string) => {
    setNewHabitSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId));
  };

  const getCompletionPercentage = (habit: NegativeHabit) => {
    if (habit.subtasks.length === 0) return 100;
    const completedSubtasks = habit.subtasks.filter(st => st.completed).length;
    return Math.round((completedSubtasks / habit.subtasks.length) * 100);
  };

  const todaysHabits = negativeHabits.filter(shouldShowHabitToday);

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
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                  <Label htmlFor="habitCategory">Category</Label>
                  <Select value={newHabitCategory} onValueChange={setNewHabitCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((category) => (
                        <SelectItem key={String(category)} value={String(category)}>
                          {String(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="habitPenalty">XP Penalty</Label>
                    <Input
                      id="habitPenalty"
                      type="number"
                      value={newHabitPenalty}
                      onChange={(e) => setNewHabitPenalty(parseInt(e.target.value) || 5)}
                      min="1"
                      max="100"
                    />
                  </div>
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
                  <div className="space-y-2">
                    {newHabitSubtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <Input
                          value={subtask.title}
                          onChange={(e) => updateSubtask(subtask.id, e.target.value)}
                          placeholder="Subtask title..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubtask(subtask.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewSubtask}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subtask
                    </Button>
                  </div>
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
          Habits to avoid - gain XP for successfully avoiding them, lose XP for failures
        </p>
      </CardHeader>
      <CardContent>
        {todaysHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No negative habits for today.</p>
            <p className="text-xs">Add habits you want to avoid and gain XP for not doing them.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysHabits.map((habit) => {
              const isAvoided = habit.avoidedDates.includes(today);
              const hasFailed = habit.failedDates.includes(today);
              const completionPercentage = getCompletionPercentage(habit);
              
              return (
                <div key={habit.id} className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isAvoided}
                            onCheckedChange={() => toggleHabitAvoidance(habit.id)}
                          />
                          <span className="text-sm text-green-600">Avoided</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={hasFailed}
                            onCheckedChange={() => markHabitFailed(habit.id)}
                          />
                          <span className="text-sm text-red-600">Failed</span>
                        </div>
                      </div>
                      <div>
                        <span className={`${isAvoided ? 'text-green-600' : hasFailed ? 'text-red-600' : ''}`}>
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
                          <span>+{habit.xpValue} XP / -{habit.xpPenalty} XP</span>
                          {habit.subtasks.length > 0 && (
                            <span>({completionPercentage}% complete)</span>
                          )}
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
                  
                  {habit.subtasks.length > 0 && (
                    <SubtaskManager
                      subtasks={habit.subtasks}
                      onSubtaskToggle={(subtaskId) => toggleSubtask(habit.id, subtaskId)}
                      isMainTaskCompleted={isAvoided}
                      xpValue={habit.xpValue}
                    />
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
