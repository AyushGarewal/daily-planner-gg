
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets, Utensils } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface WellnessLog {
  date: string;
  waterIntake: number; // in ml
  calorieIntake: number;
}

export function WellnessLogging() {
  const [wellnessLogs, setWellnessLogs] = useLocalStorage<WellnessLog[]>('wellnessLogs', []);
  const [waterInput, setWaterInput] = useState('');
  const [calorieInput, setCalorieInput] = useState('');

  const today = new Date().toDateString();
  const todayLog = wellnessLogs.find(log => log.date === today);

  const updateWellnessLog = (type: 'water' | 'calories', value: number) => {
    const existingLogIndex = wellnessLogs.findIndex(log => log.date === today);
    
    if (existingLogIndex >= 0) {
      const updatedLogs = [...wellnessLogs];
      if (type === 'water') {
        updatedLogs[existingLogIndex].waterIntake += value;
      } else {
        updatedLogs[existingLogIndex].calorieIntake += value;
      }
      setWellnessLogs(updatedLogs);
    } else {
      const newLog: WellnessLog = {
        date: today,
        waterIntake: type === 'water' ? value : 0,
        calorieIntake: type === 'calories' ? value : 0
      };
      setWellnessLogs(prev => [...prev, newLog]);
    }
  };

  const logWater = () => {
    const amount = parseInt(waterInput);
    if (amount > 0) {
      updateWellnessLog('water', amount);
      setWaterInput('');
    }
  };

  const logCalories = () => {
    const amount = parseInt(calorieInput);
    if (amount > 0) {
      updateWellnessLog('calories', amount);
      setCalorieInput('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Water Intake
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {todayLog?.waterIntake || 0} ml
            </div>
            <div className="text-sm text-muted-foreground">Today's intake</div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="ml"
              value={waterInput}
              onChange={(e) => setWaterInput(e.target.value)}
            />
            <Button onClick={logWater} disabled={!waterInput}>
              Add
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => { updateWellnessLog('water', 250); }}>
              +250ml
            </Button>
            <Button variant="outline" size="sm" onClick={() => { updateWellnessLog('water', 500); }}>
              +500ml
            </Button>
            <Button variant="outline" size="sm" onClick={() => { updateWellnessLog('water', 1000); }}>
              +1L
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Calorie Intake
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {todayLog?.calorieIntake || 0} cal
            </div>
            <div className="text-sm text-muted-foreground">Today's intake</div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="calories"
              value={calorieInput}
              onChange={(e) => setCalorieInput(e.target.value)}
            />
            <Button onClick={logCalories} disabled={!calorieInput}>
              Add
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => { updateWellnessLog('calories', 200); }}>
              +200
            </Button>
            <Button variant="outline" size="sm" onClick={() => { updateWellnessLog('calories', 500); }}>
              +500
            </Button>
            <Button variant="outline" size="sm" onClick={() => { updateWellnessLog('calories', 1000); }}>
              +1000
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
