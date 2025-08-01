
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calendar, Star, Undo2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCustomCategories } from '../hooks/useCustomCategories';
import { useXPSystem } from '../hooks/useXPSystem';
import { WeekdaySelector } from './WeekdaySelector';
import { SubtaskManager } from './SubtaskManager';
import { SideHabit, SideHabitSubtask } from '../types/sideHabits';
import { CATEGORIES } from '../types/task';
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
  
  const { categories: customCategories } = useCustomCategories();
  const { awardXP, undoXP } = useXPSystem();
  const today = new Date().toDateString();
  
  // Track XP transaction IDs for undo functionality
  const [xpTransactionIds, setXpTransactionIds] = useLocalStorage<{[habitId: string]: string}>('side-habit-xp-transactions', {});

  // Combine default and custom categories
  const allCategories = [...CATEGORIES, ...customCategories];

  // Clean up - removed old event listener that was causing state sync issues

  const addSideHabit = () => {
    console.log('Adding side habit:', { newHabitName, newHabitCategory });
    
    if (!newHabitName.trim()) {
      console.log('Habit name is empty');
      return;
    }
    
    if (!newHabitCategory) {
      console.log('Category not selected');
      return;
    }

    const validSubtasks = newHabitSubtasks.filter(st => st.title.trim());
    
    const newHabit: SideHabit = {
      id: `side_habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newHabitName.trim(),
      category: newHabitCategory,
      completedDates: [],
      recurrence: newHabitRecurrence,
      weekDays: newHabitRecurrence === 'Weekly' ? newHabitWeekDays : undefined,
      subtasks: validSubtasks,
      xpValue: newHabitXP,
      createdAt: new Date()
    };
    
    console.log('Created new habit:', newHabit);
    
    setSideHabits(prev => {
      const updated = [...prev, newHabit];
      console.log('Updated side habits:', updated);
      return updated;
    });
    
    // Reset form
    setNewHabitName('');
    setNewHabitCategory('');
    setNewHabitXP(5);
    setNewHabitRecurrence('None');
    setNewHabitWeekDays([]);
    setNewHabitSubtasks([]);
    setIsFormOpen(false);
    
    console.log('Form reset and closed');
  };

  // FIXED: Side habit XP should update immediately using the unified XP system
  const toggleHabitCompletion = (habitId: string) => {
    setSideHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.completedDates.includes(today);
        const updatedHabit = {
          ...habit,
          completedDates: wasCompleted
            ? habit.completedDates.filter(date => date !== today)
            : [...habit.completedDates, today]
        };
        
        // Calculate XP based on subtask completion if applicable
        let xpToAdd = habit.xpValue || 0;
        
        if (habit.subtasks.length > 0) {
          const completedSubtasks = habit.subtasks.filter(st => st.completed).length;
          const completionPercentage = completedSubtasks / habit.subtasks.length;
          xpToAdd = Math.round((habit.xpValue || 0) * completionPercentage);
        }
        
        if (xpToAdd > 0) {
          if (wasCompleted) {
            // Undo completion - use the XP system to reverse the transaction
            const transactionId = xpTransactionIds[habitId];
            if (transactionId) {
              console.log(`Undoing side habit completion - removing ${xpToAdd} XP for: ${habit.name}`);
              undoXP(transactionId);
              // Remove the transaction ID
              setXpTransactionIds(prev => {
                const updated = { ...prev };
                delete updated[habitId];
                return updated;
              });
            }
          } else {
            // Complete habit - use the XP system to award XP
            console.log(`Adding exactly ${xpToAdd} XP for completing side habit: ${habit.name}`);
            const transactionId = awardXP('side-habit', habitId, xpToAdd, `Completed side habit: ${habit.name}`);
            // Store the transaction ID for undo functionality
            setXpTransactionIds(prev => ({
              ...prev,
              [habitId]: transactionId
            }));
          }
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

  const addNewSubtask = () => {
    const newSubtask: SideHabitSubtask = {
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

  const getCompletionPercentage = (habit: SideHabit) => {
    if (habit.subtasks.length === 0) return 100;
    const completedSubtasks = habit.subtasks.filter(st => st.completed).length;
    return Math.round((completedSubtasks / habit.subtasks.length) * 100);
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
                      {allCategories.map((category) => (
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
          Track habits and earn XP without affecting daily completion percentage
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
              const completionPercentage = getCompletionPercentage(habit);
              
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
                          {habit.subtasks.length > 0 && (
                            <span>({completionPercentage}% complete)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHabitCompletion(habit.id)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Undo completion"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSideHabit(habit.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {habit.subtasks.length > 0 && (
                    <SubtaskManager
                      subtasks={habit.subtasks}
                      onSubtaskToggle={(subtaskId) => toggleSubtask(habit.id, subtaskId)}
                      isMainTaskCompleted={isCompleted}
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
