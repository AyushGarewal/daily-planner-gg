
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Award, Target, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

interface HabitRecord {
  id: string;
  habitName: string;
  date: string;
  completed: boolean;
  streak: number;
}

interface HabitStats {
  habitName: string;
  totalDays: number;
  completedDays: number;
  completionRate: number;
  longestStreak: number;
  currentStreak: number;
  weeklyStats: Array<{
    week: string;
    completionRate: number;
    completed: number;
    total: number;
  }>;
  monthlyStats: Array<{
    month: string;
    completionRate: number;
    completed: number;
    total: number;
  }>;
}

export function HabitPerformanceTracker() {
  const [selectedHabit, setSelectedHabit] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');
  
  // Mock data - in real app, this would come from your task/habit system
  const habits = ['Exercise', 'Reading', 'Meditation', 'Water Intake', 'Early Wake'];
  const habitRecords: HabitRecord[] = [
    // Generate sample data for the last 30 days
    ...Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return habits.map(habit => ({
        id: `${habit}-${i}`,
        habitName: habit,
        date: format(date, 'yyyy-MM-dd'),
        completed: Math.random() > 0.3, // 70% completion rate
        streak: Math.floor(Math.random() * 10)
      }));
    }).flat()
  ];

  const calculateHabitStats = (habitName: string): HabitStats => {
    const records = habitRecords.filter(r => r.habitName === habitName);
    const completed = records.filter(r => r.completed);
    
    // Calculate weekly stats
    const weeklyStats = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(new Date());
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = endOfWeek(weekStart);
      
      const weekRecords = records.filter(r => {
        const recordDate = parseISO(r.date);
        return recordDate >= weekStart && recordDate <= weekEnd;
      });
      
      const weekCompleted = weekRecords.filter(r => r.completed);
      
      weeklyStats.unshift({
        week: format(weekStart, 'MMM dd'),
        completionRate: weekRecords.length > 0 ? (weekCompleted.length / weekRecords.length) * 100 : 0,
        completed: weekCompleted.length,
        total: weekRecords.length
      });
    }

    // Calculate monthly stats
    const monthlyStats = [];
    for (let i = 0; i < 3; i++) {
      const monthStart = startOfMonth(new Date());
      monthStart.setMonth(monthStart.getMonth() - i);
      const monthEnd = endOfMonth(monthStart);
      
      const monthRecords = records.filter(r => {
        const recordDate = parseISO(r.date);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });
      
      const monthCompleted = monthRecords.filter(r => r.completed);
      
      monthlyStats.unshift({
        month: format(monthStart, 'MMM yyyy'),
        completionRate: monthRecords.length > 0 ? (monthCompleted.length / monthRecords.length) * 100 : 0,
        completed: monthCompleted.length,
        total: monthRecords.length
      });
    }

    return {
      habitName,
      totalDays: records.length,
      completedDays: completed.length,
      completionRate: records.length > 0 ? (completed.length / records.length) * 100 : 0,
      longestStreak: Math.max(...records.map(r => r.streak), 0),
      currentStreak: records[0]?.streak || 0,
      weeklyStats,
      monthlyStats
    };
  };

  const getHeatmapData = (habitName: string) => {
    const today = new Date();
    const last30Days = eachDayOfInterval({
      start: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
      end: today
    });

    return last30Days.map(date => {
      const record = habitRecords.find(r => 
        r.habitName === habitName && 
        isSameDay(parseISO(r.date), date)
      );
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'dd'),
        completed: record?.completed || false,
        dayOfWeek: date.getDay()
      };
    });
  };

  const renderHeatmap = (habitName: string) => {
    const data = getHeatmapData(habitName);
    const weeks = [];
    
    // Group days into weeks
    for (let i = 0; i < data.length; i += 7) {
      weeks.push(data.slice(i, i + 7));
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium mb-2">Last 30 Days</h4>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs text-center text-muted-foreground p-1">
              {day[0]}
            </div>
          ))}
          {data.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded text-xs flex items-center justify-center ${
                day.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'
              }`}
              title={format(parseISO(day.date), 'MMM dd, yyyy')}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const allHabitsStats = habits.map(calculateHabitStats);
  const selectedStats = selectedHabit === 'all' ? allHabitsStats[0] : calculateHabitStats(selectedHabit);

  const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Habit Performance Tracker
          </h2>
          <p className="text-muted-foreground">
            Track and analyze your habit performance over time
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedHabit} onValueChange={setSelectedHabit}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select habit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Habits</SelectItem>
              {habits.map(habit => (
                <SelectItem key={habit} value={habit}>{habit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedHabit !== 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedHabit} - Calendar Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderHeatmap(selectedHabit)}
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Weekly</TabsTrigger>
          <TabsTrigger value="month">Monthly</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">
                      {selectedStats?.weeklyStats[selectedStats.weeklyStats.length - 1]?.completionRate.toFixed(0) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold">{selectedStats?.currentStreak || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                    <p className="text-2xl font-bold">{selectedStats?.longestStreak || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {selectedStats?.weeklyStats[selectedStats.weeklyStats.length - 1]?.completed || 0}/7
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={selectedStats?.weeklyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                  <Bar dataKey="completionRate" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedStats?.monthlyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                  <Line type="monotone" dataKey="completionRate" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Days Tracked:</span>
                    <Badge variant="secondary">{selectedStats?.totalDays || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Completed:</span>
                    <Badge variant="secondary">{selectedStats?.completedDays || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <Badge className="bg-green-500">
                      {selectedStats?.completionRate.toFixed(1) || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Longest Streak:</span>
                    <Badge className="bg-yellow-500">{selectedStats?.longestStreak || 0} days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedHabit === 'all' && (
              <Card>
                <CardHeader>
                  <CardTitle>Habits Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={allHabitsStats.map((stat, index) => ({
                          name: stat.habitName,
                          value: stat.completionRate,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allHabitsStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
