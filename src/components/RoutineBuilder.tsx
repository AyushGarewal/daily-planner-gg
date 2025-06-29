
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Clock, Edit, Trash2, GripVertical, Play, Pause } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Routine, RoutineHabit } from '../types/routine';
import { CATEGORIES } from '../types/task';
import { format } from 'date-fns';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function RoutineBuilder() {
  const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [currentRoutineId, setCurrentRoutineId] = useState<string | null>(null);

  const [routineForm, setRoutineForm] = useState({
    name: '',
    description: '',
    startTime: '06:00',
    endTime: '08:00',
    daysOfWeek: [1, 2, 3, 4, 5], // weekdays by default
  });

  const [habitForm, setHabitForm] = useState({
    title: '',
    description: '',
    xpValue: 10,
    category: 'Personal',
    estimatedDuration: 15,
  });

  const resetRoutineForm = () => {
    setRoutineForm({
      name: '',
      description: '',
      startTime: '06:00',
      endTime: '08:00',
      daysOfWeek: [1, 2, 3, 4, 5],
    });
  };

  const resetHabitForm = () => {
    setHabitForm({
      title: '',
      description: '',
      xpValue: 10,
      category: 'Personal',
      estimatedDuration: 15,
    });
  };

  const handleCreateRoutine = () => {
    if (!routineForm.name.trim()) return;

    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      name: routineForm.name,
      description: routineForm.description,
      startTime: routineForm.startTime,
      endTime: routineForm.endTime,
      habits: [],
      active: true,
      daysOfWeek: routineForm.daysOfWeek,
      createdAt: new Date(),
    };

    setRoutines(prev => [...prev, newRoutine]);
    setIsCreating(false);
    resetRoutineForm();
  };

  const handleAddHabit = () => {
    if (!habitForm.title.trim() || !currentRoutineId) return;

    const newHabit: RoutineHabit = {
      id: crypto.randomUUID(),
      title: habitForm.title,
      description: habitForm.description,
      xpValue: habitForm.xpValue,
      category: habitForm.category,
      estimatedDuration: habitForm.estimatedDuration,
      order: 0,
    };

    setRoutines(prev => prev.map(routine => {
      if (routine.id === currentRoutineId) {
        return {
          ...routine,
          habits: [...routine.habits, { ...newHabit, order: routine.habits.length }]
        };
      }
      return routine;
    }));

    setIsAddingHabit(false);
    setCurrentRoutineId(null);
    resetHabitForm();
  };

  const toggleRoutineActive = (routineId: string) => {
    setRoutines(prev => prev.map(routine => 
      routine.id === routineId 
        ? { ...routine, active: !routine.active }
        : routine
    ));
  };

  const deleteRoutine = (routineId: string) => {
    setRoutines(prev => prev.filter(routine => routine.id !== routineId));
  };

  const removeHabitFromRoutine = (routineId: string, habitId: string) => {
    setRoutines(prev => prev.map(routine => {
      if (routine.id === routineId) {
        return {
          ...routine,
          habits: routine.habits.filter(habit => habit.id !== habitId)
        };
      }
      return routine;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-500" />
            Routine Builder
          </h2>
          <p className="text-muted-foreground">
            Create structured routines with habits and time blocks
          </p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Routine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Routine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Routine Name</label>
                <Input
                  value={routineForm.name}
                  onChange={(e) => setRoutineForm({ ...routineForm, name: e.target.value })}
                  placeholder="e.g., Morning Routine"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={routineForm.description}
                  onChange={(e) => setRoutineForm({ ...routineForm, description: e.target.value })}
                  placeholder="Brief description of this routine"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={routineForm.startTime}
                    onChange={(e) => setRoutineForm({ ...routineForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={routineForm.endTime}
                    onChange={(e) => setRoutineForm({ ...routineForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Days of Week</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={routineForm.daysOfWeek.includes(day.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRoutineForm({
                              ...routineForm,
                              daysOfWeek: [...routineForm.daysOfWeek, day.value]
                            });
                          } else {
                            setRoutineForm({
                              ...routineForm,
                              daysOfWeek: routineForm.daysOfWeek.filter(d => d !== day.value)
                            });
                          }
                        }}
                      />
                      <label htmlFor={`day-${day.value}`} className="text-sm">
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateRoutine} className="flex-1">
                  Create Routine
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Routines List */}
      <div className="grid gap-4">
        {routines.map((routine) => (
          <Card key={routine.id} className={`${routine.active ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRoutineActive(routine.id)}
                    className={routine.active ? 'text-green-600' : 'text-gray-400'}
                  >
                    {routine.active ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <div>
                    <CardTitle className="text-lg">{routine.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {routine.startTime} - {routine.endTime} • {routine.habits.length} habits
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {routine.daysOfWeek.map(day => (
                      <Badge key={day} variant="secondary" className="text-xs">
                        {DAYS_OF_WEEK[day].label}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRoutine(routine.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {routine.description && (
                <p className="text-sm text-muted-foreground mb-4">{routine.description}</p>
              )}
              
              <div className="space-y-2">
                {routine.habits.map((habit, index) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{habit.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{habit.category}</Badge>
                          <span>{habit.estimatedDuration}min</span>
                          <span>+{habit.xpValue} XP</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHabitFromRoutine(routine.id, habit.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="dashed"
                  className="w-full"
                  onClick={() => {
                    setCurrentRoutineId(routine.id);
                    setIsAddingHabit(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Habit Dialog */}
      <Dialog open={isAddingHabit} onOpenChange={setIsAddingHabit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Habit to Routine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Habit Name</label>
              <Input
                value={habitForm.title}
                onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                placeholder="e.g., Drink water"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={habitForm.description}
                onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={habitForm.category}
                  onValueChange={(value) => setHabitForm({ ...habitForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Duration (min)</label>
                <Input
                  type="number"
                  min="1"
                  value={habitForm.estimatedDuration}
                  onChange={(e) => setHabitForm({ ...habitForm, estimatedDuration: parseInt(e.target.value) || 15 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">XP Value</label>
              <Input
                type="number"
                min="1"
                value={habitForm.xpValue}
                onChange={(e) => setHabitForm({ ...habitForm, xpValue: parseInt(e.target.value) || 10 })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddHabit} className="flex-1">
                Add Habit
              </Button>
              <Button variant="outline" onClick={() => setIsAddingHabit(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {routines.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No routines created yet</h3>
          <p className="text-sm mb-4">Create your first routine to structure your day!</p>
          <p className="text-xs">Examples: "Morning Routine", "Evening Wind-down", "Workout Session"</p>
        </div>
      )}
    </div>
  );
}
