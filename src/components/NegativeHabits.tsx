
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format } from 'date-fns';

interface NegativeHabit {
  id: string;
  title: string;
  description?: string;
  category: string;
  xpReward: number;
  createdAt: Date;
}

interface NegativeHabitResistance {
  id: string;
  negativeHabitId: string;
  date: string;
  resistedAt: Date;
  xpGained: number;
}

export function NegativeHabits() {
  const [negativeHabits, setNegativeHabits] = useLocalStorage<NegativeHabit[]>('negativeHabits', []);
  const [resistances, setResistances] = useLocalStorage<NegativeHabitResistance[]>('negativeHabitResistances', []);
  const [userProgress, setUserProgress] = useLocalStorage<any>('userProgress', { totalXP: 0, level: 1 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [xpReward, setXpReward] = useState(10);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const isResistedToday = (habitId: string) => {
    return resistances.some(resistance => 
      resistance.negativeHabitId === habitId && 
      resistance.date === todayStr
    );
  };

  const toggleResistance = (habitId: string) => {
    const habit = negativeHabits.find(h => h.id === habitId);
    if (!habit) return;

    const existingResistance = resistances.find(resistance => 
      resistance.negativeHabitId === habitId && 
      resistance.date === todayStr
    );

    if (existingResistance) {
      // Remove resistance and subtract XP
      setResistances(prev => prev.filter(r => r.id !== existingResistance.id));
      setUserProgress(prev => ({
        ...prev,
        totalXP: Math.max(0, prev.totalXP - existingResistance.xpGained)
      }));
    } else {
      // Add resistance and gain XP
      const newResistance: NegativeHabitResistance = {
        id: crypto.randomUUID(),
        negativeHabitId: habitId,
        date: todayStr,
        resistedAt: new Date(),
        xpGained: habit.xpReward
      };
      setResistances(prev => [...prev, newResistance]);
      setUserProgress(prev => ({
        ...prev,
        totalXP: prev.totalXP + habit.xpReward
      }));
    }
  };

  const addNegativeHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: NegativeHabit = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      xpReward,
      createdAt: new Date()
    };

    setNegativeHabits(prev => [...prev, newHabit]);
    setTitle('');
    setDescription('');
    setCategory('Personal');
    setXpReward(10);
    setIsFormOpen(false);
  };

  const deleteNegativeHabit = (habitId: string) => {
    setNegativeHabits(prev => prev.filter(h => h.id !== habitId));
    setResistances(prev => prev.filter(r => r.negativeHabitId !== habitId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Negative Habits
          </h2>
          <p className="text-muted-foreground">Resist bad habits and gain XP for your willpower</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Negative Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Negative Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={addNegativeHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Habit to Avoid *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. Smoking, Junk food, Social media scrolling"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Why do you want to avoid this?"
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
                  <option value="Productivity">Productivity</option>
                  <option value="Social">Social</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">XP Reward for Resistance</label>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value) || 10)}
                  className="w-full p-2 border rounded-md"
                  min="5"
                  max="50"
                />
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

      {negativeHabits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No negative habits tracked</h3>
            <p className="text-muted-foreground mb-4">
              Add habits you want to avoid and gain XP for resisting them
            </p>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Negative Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {negativeHabits.map((habit) => {
            const resisted = isResistedToday(habit.id);
            
            return (
              <Card key={habit.id} className={`cursor-pointer transition-all ${resisted ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {habit.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{habit.xpReward} XP
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNegativeHabit(habit.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    {habit.title}
                  </CardTitle>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground">{habit.description}</p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Today</span>
                    <button
                      onClick={() => toggleResistance(habit.id)}
                      className="flex items-center gap-2"
                    >
                      {resisted ? (
                        <ShieldCheck className="h-6 w-6 text-green-500" />
                      ) : (
                        <Shield className="h-6 w-6 text-orange-400" />
                      )}
                      <span className="text-sm">
                        {resisted ? 'Resisted!' : 'Click if resisted'}
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
