
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Moon, Sun, Plus, TrendingUp, Clock, Calendar } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SleepRecord, SleepStats } from '../types/sleep';
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function SleepTracker() {
  const [sleepRecords, setSleepRecords] = useLocalStorage<SleepRecord[]>('sleepRecords', []);
  const [isLogging, setIsLogging] = useState(false);
  
  const [sleepForm, setSleepForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    bedtime: '23:00',
    wakeTime: '07:00',
    sleepQuality: 'good' as SleepRecord['sleepQuality'],
    notes: '',
  });

  const calculateSleepDuration = (bedtime: string, wakeTime: string): number => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    
    let bedTimeMinutes = bedHour * 60 + bedMin;
    let wakeTimeMinutes = wakeHour * 60 + wakeMin;
    
    // Handle cross-midnight sleep
    if (wakeTimeMinutes < bedTimeMinutes) {
      wakeTimeMinutes += 24 * 60; // Add 24 hours
    }
    
    const durationMinutes = wakeTimeMinutes - bedTimeMinutes;
    return Math.round((durationMinutes / 60) * 10) / 10; // Round to 1 decimal
  };

  const handleLogSleep = () => {
    const sleepDuration = calculateSleepDuration(sleepForm.bedtime, sleepForm.wakeTime);
    
    const newRecord: SleepRecord = {
      id: crypto.randomUUID(),
      date: sleepForm.date,
      bedtime: sleepForm.bedtime,
      wakeTime: sleepForm.wakeTime,
      sleepDuration,
      sleepQuality: sleepForm.sleepQuality,
      notes: sleepForm.notes,
      createdAt: new Date(),
    };

    setSleepRecords(prev => {
      // Remove existing record for the same date if it exists
      const filtered = prev.filter(record => record.date !== sleepForm.date);
      return [...filtered, newRecord].sort((a, b) => b.date.localeCompare(a.date));
    });

    setIsLogging(false);
    setSleepForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      bedtime: '23:00',
      wakeTime: '07:00',
      sleepQuality: 'good',
      notes: '',
    });
  };

  const sleepStats = useMemo<SleepStats>(() => {
    if (sleepRecords.length === 0) {
      return {
        averageSleepDuration: 0,
        averageBedtime: '00:00',
        averageWakeTime: '00:00',
        sleepConsistency: 0,
        weeklyTrend: 'stable',
      };
    }

    const avgDuration = sleepRecords.reduce((sum, record) => sum + record.sleepDuration, 0) / sleepRecords.length;
    
    // Calculate average bedtime and wake time
    const bedtimeMinutes = sleepRecords.map(r => {
      const [hour, min] = r.bedtime.split(':').map(Number);
      return hour * 60 + min;
    });
    
    const wakeTimeMinutes = sleepRecords.map(r => {
      const [hour, min] = r.wakeTime.split(':').map(Number);
      return hour * 60 + min;
    });

    const avgBedtimeMin = bedtimeMinutes.reduce((sum, min) => sum + min, 0) / bedtimeMinutes.length;
    const avgWakeTimeMin = wakeTimeMinutes.reduce((sum, min) => sum + min, 0) / wakeTimeMinutes.length;

    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // Calculate consistency (inverse of standard deviation)
    const variance = sleepRecords.reduce((sum, record) => {
      return sum + Math.pow(record.sleepDuration - avgDuration, 2);
    }, 0) / sleepRecords.length;
    
    const consistency = Math.max(0, 100 - (Math.sqrt(variance) * 20));

    return {
      averageSleepDuration: Math.round(avgDuration * 10) / 10,
      averageBedtime: formatTime(avgBedtimeMin),
      averageWakeTime: formatTime(avgWakeTimeMin),
      sleepConsistency: Math.round(consistency),
      weeklyTrend: 'stable', // Simplified for now
    };
  }, [sleepRecords]);

  const weeklyChartData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const record = sleepRecords.find(r => r.date === dateStr);
      
      return {
        day: format(day, 'EEE'),
        date: dateStr,
        duration: record?.sleepDuration || 0,
        bedtime: record?.bedtime || null,
        wakeTime: record?.wakeTime || null,
      };
    });
  }, [sleepRecords]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return '😴';
      case 'good': return '😊';
      case 'fair': return '😐';
      case 'poor': return '😫';
      default: return '💤';
    }
  };

  const recentRecords = sleepRecords.slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Moon className="h-6 w-6 text-blue-500" />
            Sleep Tracker
          </h2>
          <p className="text-muted-foreground">
            Track your sleep patterns and improve your rest quality
          </p>
        </div>
        
        <Dialog open={isLogging} onOpenChange={setIsLogging}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Sleep Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={sleepForm.date}
                  onChange={(e) => setSleepForm({ ...sleepForm, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Bedtime
                  </label>
                  <Input
                    type="time"
                    value={sleepForm.bedtime}
                    onChange={(e) => setSleepForm({ ...sleepForm, bedtime: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Wake Time
                  </label>
                  <Input
                    type="time"
                    value={sleepForm.wakeTime}
                    onChange={(e) => setSleepForm({ ...sleepForm, wakeTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Sleep Quality</label>
                <Select
                  value={sleepForm.sleepQuality || 'good'}
                  onValueChange={(value: SleepRecord['sleepQuality']) => 
                    setSleepForm({ ...sleepForm, sleepQuality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">😴 Excellent</SelectItem>
                    <SelectItem value="good">😊 Good</SelectItem>
                    <SelectItem value="fair">😐 Fair</SelectItem>
                    <SelectItem value="poor">😫 Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={sleepForm.notes}
                  onChange={(e) => setSleepForm({ ...sleepForm, notes: e.target.value })}
                  placeholder="Any notes about your sleep..."
                  rows={2}
                />
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">Sleep Duration</p>
                <p className="text-lg font-bold text-blue-600">
                  {calculateSleepDuration(sleepForm.bedtime, sleepForm.wakeTime)} hours
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleLogSleep} className="flex-1">
                  Log Sleep
                </Button>
                <Button variant="outline" onClick={() => setIsLogging(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sleep Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{sleepStats.averageSleepDuration}h</div>
              <p className="text-sm text-muted-foreground">Avg Sleep</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Moon className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
              <div className="text-2xl font-bold">{sleepStats.averageBedtime}</div>
              <p className="text-sm text-muted-foreground">Avg Bedtime</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{sleepStats.averageWakeTime}</div>
              <p className="text-sm text-muted-foreground">Avg Wake Time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{sleepStats.sleepConsistency}%</div>
              <p className="text-sm text-muted-foreground">Consistency</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Sleep Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sleep Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 12]} />
                <Tooltip 
                  formatter={(hours: number) => [`${hours}h`, 'Sleep Duration']}
                  labelFormatter={(day) => `${day}`}
                />
                <Bar dataKey="duration" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sleep Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sleep Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getQualityIcon(record.sleepQuality || 'good')}</div>
                  <div>
                    <p className="font-medium">{format(parseISO(record.date), 'MMM dd, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.bedtime} → {record.wakeTime} • {record.sleepDuration}h
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getQualityColor(record.sleepQuality || 'good')} text-white border-none`}>
                    {record.sleepQuality}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {recentRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Moon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No sleep records yet</p>
              <p className="text-sm">Start logging your sleep to track your patterns!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
