
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Flame, Plus, Minus } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format } from 'date-fns';

interface WellnessEntry {
  id: string;
  date: string;
  waterIntake: number; // in ml
  calorieIntake: number;
  createdAt: Date;
  updatedAt: Date;
}

export function WellnessLogging() {
  const [wellnessEntries, setWellnessEntries] = useLocalStorage<WellnessEntry[]>('wellnessEntries', []);
  const [waterInput, setWaterInput] = useState('');
  const [calorieInput, setCalorieInput] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = wellnessEntries.find(entry => entry.date === today);

  const waterGoal = 2000; // ml per day
  const calorieGoal = 2200; // calories per day

  const currentWater = todayEntry?.waterIntake || 0;
  const currentCalories = todayEntry?.calorieIntake || 0;

  const waterProgress = Math.min((currentWater / waterGoal) * 100, 100);
  const calorieProgress = Math.min((currentCalories / calorieGoal) * 100, 100);

  const updateTodayEntry = (updates: Partial<Pick<WellnessEntry, 'waterIntake' | 'calorieIntake'>>) => {
    setWellnessEntries(prev => {
      const existingIndex = prev.findIndex(entry => entry.date === today);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...updates,
          updatedAt: new Date()
        };
        return updated;
      } else {
        const newEntry: WellnessEntry = {
          id: crypto.randomUUID(),
          date: today,
          waterIntake: updates.waterIntake || 0,
          calorieIntake: updates.calorieIntake || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return [...prev, newEntry];
      }
    });
  };

  const addWater = () => {
    const amount = parseInt(waterInput) || 0;
    if (amount > 0) {
      updateTodayEntry({ waterIntake: currentWater + amount });
      setWaterInput('');
    }
  };

  const addCalories = () => {
    const amount = parseInt(calorieInput) || 0;
    if (amount > 0) {
      updateTodayEntry({ calorieIntake: currentCalories + amount });
      setCalorieInput('');
    }
  };

  const quickAddWater = (amount: number) => {
    updateTodayEntry({ waterIntake: currentWater + amount });
  };

  const quickAddCalories = (amount: number) => {
    updateTodayEntry({ calorieIntake: currentCalories + amount });
  };

  const resetWater = () => {
    updateTodayEntry({ waterIntake: 0 });
  };

  const resetCalories = () => {
    updateTodayEntry({ calorieIntake: 0 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Wellness Logging</h2>
        <p className="text-muted-foreground">Track your daily water and calorie intake</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Water Intake */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Water Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {currentWater.toLocaleString()} ml
              </div>
              <div className="text-sm text-muted-foreground">
                Goal: {waterGoal.toLocaleString()} ml
              </div>
            </div>
            
            <Progress value={waterProgress} className="h-3" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(waterProgress)}% of daily goal
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                  placeholder="Amount in ml"
                  className="flex-1 p-2 border rounded-md"
                />
                <Button onClick={addWater} disabled={!waterInput}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => quickAddWater(250)}>
                  +250ml
                </Button>
                <Button size="sm" variant="outline" onClick={() => quickAddWater(500)}>
                  +500ml
                </Button>
                <Button size="sm" variant="outline" onClick={() => quickAddWater(1000)}>
                  +1L
                </Button>
              </div>
              
              <Button size="sm" variant="destructive" onClick={resetWater} className="w-full">
                Reset Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calorie Intake */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Calorie Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {currentCalories.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Goal: {calorieGoal.toLocaleString()} cal
              </div>
            </div>
            
            <Progress value={calorieProgress} className="h-3" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(calorieProgress)}% of daily goal
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={calorieInput}
                  onChange={(e) => setCalorieInput(e.target.value)}
                  placeholder="Calories"
                  className="flex-1 p-2 border rounded-md"
                />
                <Button onClick={addCalories} disabled={!calorieInput}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => quickAddCalories(100)}>
                  +100
                </Button>
                <Button size="sm" variant="outline" onClick={() => quickAddCalories(300)}>
                  +300
                </Button>
                <Button size="sm" variant="outline" onClick={() => quickAddCalories(500)}>
                  +500
                </Button>
              </div>
              
              <Button size="sm" variant="destructive" onClick={resetCalories} className="w-full">
                Reset Today
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          {wellnessEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No entries yet. Start logging your wellness data!
            </p>
          ) : (
            <div className="space-y-2">
              {wellnessEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 7)
                .map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </span>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        {entry.waterIntake}ml
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {entry.calorieIntake} cal
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
