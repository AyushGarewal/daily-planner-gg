
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Droplets, Apple } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DailyLog {
  date: string;
  water: number; // in ml
  calories: number;
}

export function WaterCalorieTracker() {
  const [dailyLogs, setDailyLogs] = useLocalStorage<DailyLog[]>('water-calorie-logs', []);
  const [waterInput, setWaterInput] = useState(250); // Default 250ml
  const [calorieInput, setCalorieInput] = useState(100); // Default 100 calories
  
  const today = new Date().toDateString();
  const todayLog = dailyLogs.find(log => log.date === today) || { date: today, water: 0, calories: 0 };
  
  const updateLog = (waterChange: number, calorieChange: number) => {
    setDailyLogs(prev => {
      const existingIndex = prev.findIndex(log => log.date === today);
      const newWater = Math.max(0, todayLog.water + waterChange);
      const newCalories = Math.max(0, todayLog.calories + calorieChange);
      
      const newLog: DailyLog = {
        date: today,
        water: newWater,
        calories: newCalories
      };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newLog;
        return updated;
      } else {
        return [...prev, newLog];
      }
    });
  };
  
  const addWater = () => {
    updateLog(waterInput, 0);
  };
  
  const subtractWater = () => {
    updateLog(-waterInput, 0);
  };
  
  const addCalories = () => {
    updateLog(0, calorieInput);
  };
  
  const subtractCalories = () => {
    updateLog(0, -calorieInput);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Water & Calorie Tracker</CardTitle>
        <p className="text-sm text-muted-foreground">Track your daily water intake and calories</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Water Tracking */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Water Intake</h3>
          </div>
          
          <div className="text-2xl font-bold text-blue-600">
            {todayLog.water} ml
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="waterAmount">Amount (ml):</Label>
            <Input
              id="waterAmount"
              type="number"
              value={waterInput}
              onChange={(e) => setWaterInput(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-20"
              min="0"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={addWater} className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Add Water
            </Button>
            <Button 
              onClick={subtractWater} 
              variant="outline" 
              className="flex-1 gap-2"
              disabled={todayLog.water === 0}
            >
              <Minus className="h-4 w-4" />
              Remove Water
            </Button>
          </div>
        </div>
        
        {/* Calorie Tracking */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Calories</h3>
          </div>
          
          <div className="text-2xl font-bold text-green-600">
            {todayLog.calories} cal
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="calorieAmount">Amount (cal):</Label>
            <Input
              id="calorieAmount"
              type="number"
              value={calorieInput}
              onChange={(e) => setCalorieInput(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-20"
              min="0"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={addCalories} className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Add Calories
            </Button>
            <Button 
              onClick={subtractCalories} 
              variant="outline" 
              className="flex-1 gap-2"
              disabled={todayLog.calories === 0}
            >
              <Minus className="h-4 w-4" />
              Remove Calories
            </Button>
          </div>
        </div>
        
        {/* Today's Summary */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Today's Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-bold text-blue-600">{todayLog.water} ml</div>
              <div className="text-muted-foreground">Water</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-bold text-green-600">{todayLog.calories} cal</div>
              <div className="text-muted-foreground">Calories</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
