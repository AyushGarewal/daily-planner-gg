
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
import { NegativeHabit, NegativeHabitSubtask } from '../types/sideHabits';
import { getDay } from 'date-fns';

export function NegativeHabitsPage() {
  const [negativeHabits, setNegativeHabits] = useLocalStorage<NegativeHabit[]>('negativeHabits', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Personal');
  const [newHabitXP, setNewHabitXP] = useState(10);
  const [newHabitPenalty, setNewHabitPenalty] = useState(5);
  const [newHabitRecurrence, setNewHabitRecurrence] = useState<'None' | 'Daily' | 'Weekly'>('None');
  const [newHabitWeekDays, setNewHabitWeekDays] = useState<number[]>([]);
  const [newHabitSubtasks, setNewHabitSubtasks] = useState<NegativeHabitSubtask[]>([]);
  
  const { categories } = useCustomCategories();
  const { addBonusXP, addTask } = useTasks();
  const today = new Date().toDateString();

  // Ensure we have valid categories
  const validCategories = categories.length > 0 ? categories : ['Personal', 'Work', 'Health', 'Learning', 'Other'];

  const addNegativeHabit = () => {
    console.log('Adding negative habit:', { newHabitName, newHabitCategory });
    
    if (newHabitName.trim() && newHabitCategory) {
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
        subtasks: newHabitSubtasks.filter(st => st.title.trim()),
        createdAt: new Date()
      };
      
      console.log('Creating new negative habit:', newHabit);
      setNegativeHabits(prev => [...prev, newHabit]);
      
      // Also add to main tasks for tracking purposes
      addTask({
        title: `Avoid: ${newHabitName.trim()}`,
        description: `Negative habit to avoid: ${newHabitName.trim()}`,
        subtasks: newHabitSubtasks.filter(st => st.title.trim()).map(st => ({
          id: st.id,
          title: st.title,
          completed: false
        })),
        dueDate: new Date(),
        priority: 'High',
        recurrence: newHabitRecurrence,
        xpValue: newHabitXP,
        category: newHabitCategory,
        taskType: 'normal',
        type: 'habit',
        weekDays: newHabitRecurrence === 'Weekly' ? newHabitWeekDays : undefined,
        customCategory: newHabitCategory
      });
      
      // Reset form
      setNewHabitName('');
      setNewHabitCategory('Personal');
      setNewHabitXP(10);
      setNewHabitPenalty(5);
      setNewHabitRecurrence('None');
      setNewHabitWeekDays([]);
      setNewHabitSubtasks([]);
      setIsFormOpen(false);
      
      console.log('Negative habit added successfully');
    } else {
      console.log('Failed to add negative habit - missing required fields');
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
            console.log(`Negative habit avoidance XP: ${completedSubtasks}/${habit.subtasks.length} = ${Math.round(completionPercentage * 100)}% = ${xpToAdd} XP`);
          }
          
          if (xpToAdd > 0) {
            addBonusXP(xpToAdd);
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
          console.log(`Negative habit failed - applying ${habit.xpPenalty} XP penalty`);
          addBonusXP(-habit.xpPenalty);
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
        console.log(`Toggled subtask for negative habit ${habitId}`);
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            Negative Habits
          </h2>
          <p className="text-muted-foreground">
            Habits to avoid - gain XP for successfully avoiding them, lose XP for failures
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
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
                    {validCategories.map((category) => (
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

      {todaysHabits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No negative habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Add habits you want to avoid and gain XP for not doing them
            </p>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Negative Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {todaysHabits.map((habit) => {
            const isAvoided = habit.avoidedDates.includes(today);
            const hasFailed = habit.failedDates.includes(today);
            const completionPercentage = getCompletionPercentage(habit);
            
            return (
              <Card key={habit.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
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
                        <span className={`font-medium ${isAvoided ? 'text-green-600' : hasFailed ? 'text-red-600' : ''}`}>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
