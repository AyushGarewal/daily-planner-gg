
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Circle, CheckCircle2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, isSameDay } from 'date-fns';

interface SideHabit {
  id: string;
  title: string;
  description?: string;
  category: string;
  createdAt: Date;
}

interface SideHabitCompletion {
  id: string;
  sideHabitId: string;
  date: string;
  completedAt: Date;
}

export function SideHabits() {
  const [sideHabits, setSideHabits] = useLocalStorage<SideHabit[]>('sideHabits', []);
  const [completions, setCompletions] = useLocalStorage<SideHabitCompletion[]>('sideHabitCompletions', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const isCompletedToday = (habitId: string) => {
    return completions.some(completion => 
      completion.sideHabitId === habitId && 
      completion.date === todayStr
    );
  };

  const toggleCompletion = (habitId: string) => {
    const existingCompletion = completions.find(completion => 
      completion.sideHabitId === habitId && 
      completion.date === todayStr
    );

    if (existingCompletion) {
      setCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
    } else {
      const newCompletion: SideHabitCompletion = {
        id: crypto.randomUUID(),
        sideHabitId: habitId,
        date: todayStr,
        completedAt: new Date()
      };
      setCompletions(prev => [...prev, newCompletion]);
    }
  };

  const addSideHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: SideHabit = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      createdAt: new Date()
    };

    setSideHabits(prev => [...prev, newHabit]);
    setTitle('');
    setDescription('');
    setCategory('Personal');
    setIsFormOpen(false);
  };

  const deleteSideHabit = (habitId: string) => {
    setSideHabits(prev => prev.filter(h => h.id !== habitId));
    setCompletions(prev => prev.filter(c => c.sideHabitId !== habitId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Side Habits</h2>
          <p className="text-muted-foreground">Track habits without affecting XP or streaks</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Side Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Side Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={addSideHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. Read for 10 minutes"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                  <option value="Social">Social</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add Habit</Button>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sideHabits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Circle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No side habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Create habits to track without affecting your main progress
            </p>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Side Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sideHabits.map((habit) => {
            const completed = isCompletedToday(habit.id);
            
            return (
              <Card key={habit.id} className={`cursor-pointer transition-all ${completed ? 'bg-green-50 border-green-200' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {habit.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSideHabit(habit.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{habit.title}</CardTitle>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground">{habit.description}</p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Today</span>
                    <button
                      onClick={() => toggleCompletion(habit.id)}
                      className="flex items-center gap-2"
                    >
                      {completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400" />
                      )}
                      <span className="text-sm">
                        {completed ? 'Done' : 'Not done'}
                      </span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
