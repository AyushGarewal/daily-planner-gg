
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Award, Target, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, subDays, getDay } from 'date-fns';
import { useTasks } from '../hooks/useTasks';

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
  const { tasks, getUserHabits } = useTasks();
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');
  
  const userHabits = getUserHabits();
  
  // Set default selected habit if none selected
  React.useEffect(() => {
    if (userHabits.length > 0 && !selectedHabit) {
      setSelectedHabit(userHabits[0].id);
    }
  }, [userHabits, selectedHabit]);

  const calculateHabitStats = (habitId: string): HabitStats => {
    const baseHabit = userHabits.find(h => h.id === habitId);
    if (!baseHabit) {
      return {
        habitName: '',
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        longestStreak: 0,
        currentStreak: 0,
        weeklyStats: [],
        monthlyStats: []
      };
    }

    // Get all instances of this habit (including recurring ones)
    const habitInstances = tasks.filter(task => 
      task.type === 'habit' && 
      task.title === baseHabit.title && 
      task.category === baseHabit.category
    );

    const completed = habitInstances.filter(task => task.completed);
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sortedInstances = habitInstances
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    for (const instance of sortedInstances) {
      if (instance.completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    // Calculate current streak from recent instances
    const recentInstances = sortedInstances.slice(-7).reverse();
    for (const instance of recentInstances) {
      if (instance.completed) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate weekly stats
    const weeklyStats = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfWeek(weekStart);
      
      const weekInstances = habitInstances.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
      
      const weekCompleted = weekInstances.filter(task => task.completed);
      
      weeklyStats.unshift({
        week: format(weekStart, 'MMM dd'),
        completionRate: weekInstances.length > 0 ? (weekCompleted.length / weekInstances.length) * 100 : 0,
        completed: weekCompleted.length,
        total: weekInstances.length
      });
    }

    // Calculate monthly stats
    const monthlyStats = [];
    for (let i = 0; i < 3; i++) {
      const monthStart = startOfMonth(subDays(new Date(), i * 30));
      const monthEnd = endOfMonth(monthStart);
      
      const monthInstances = habitInstances.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });
      
      const monthCompleted = monthInstances.filter(task => task.completed);
      
      monthlyStats.unshift({
        month: format(monthStart, 'MMM yyyy'),
        completionRate: monthInstances.length > 0 ? (monthCompleted.length / monthInstances.length) * 100 : 0,
        completed: monthCompleted.length,
        total: monthInstances.length
      });
    }

    return {
      habitName: baseHabit.title,
      totalDays: habitInstances.length,
      completedDays: completed.length,
      completionRate: habitInstances.length > 0 ? (completed.length / habitInstances.length) * 100 : 0,
      longestStreak,
      currentStreak,
      weeklyStats,
      monthlyStats
    };
  };

  const getHeatmapData = (habitId: string) => {
    const baseHabit = userHabits.find(h => h.id === habitId);
    if (!baseHabit) return [];

    const today = new Date();
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today
    });

    const habitInstances = tasks.filter(task => 
      task.type === 'habit' && 
      task.title === baseHabit.title && 
      task.category === baseHabit.category
    );

    return last30Days.map(date => {
      const instance = habitInstances.find(task => 
        isSameDay(new Date(task.dueDate), date)
      );
      
      // For weekly habits, check if this day should have the habit
      let shouldHaveHabit = true;
      if (baseHabit.recurrence === 'Weekly' && baseHabit.weekDays) {
        const dayOfWeek = getDay(date);
        shouldHaveHabit = baseHabit.weekDays.includes(dayOfWeek);
      }
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'dd'),
        completed: instance?.completed || false,
        shouldHaveHabit,
        dayOfWeek: date.getDay()
      };
    });
  };

  const renderHeatmap = (habitId: string) => {
    const data = getHeatmapData(habitId);

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
                !day.shouldHaveHabit 
                  ? 'bg-gray-100 dark:bg-gray-800 text-muted-foreground' 
                  : day.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-200 dark:bg-red-900/30 text-muted-foreground'
              }`}
              title={`${format(parseISO(day.date), 'MMM dd, yyyy')} - ${day.completed ? 'Completed' : day.shouldHaveHabit ? 'Missed' : 'Not scheduled'}`}
            >
              {day.day}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 dark:bg-red-900/30 rounded"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <span>Not scheduled</span>
          </div>
        </div>
      </div>
    );
  };

  if (userHabits.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No habits to track
          </h3>
          <p className="text-sm text-muted-foreground">
            Create some habits to see performance insights here!
          </p>
        </div>
      </div>
    );
  }

  const selectedStats = selectedHabit ? calculateHabitStats(selectedHabit) : null;
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
              {userHabits.map(habit => (
                <SelectItem key={habit.id} value={habit.id}>{habit.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedStats && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedStats.habitName} - Calendar Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderHeatmap(selectedHabit)}
            </CardContent>
          </Card>

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
                          {selectedStats.weeklyStats[selectedStats.weeklyStats.length - 1]?.completionRate.toFixed(0) || 0}%
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
                        <p className="text-2xl font-bold">{selectedStats.currentStreak}</p>
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
                        <p className="text-2xl font-bold">{selectedStats.longestStreak}</p>
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
                          {selectedStats.weeklyStats[selectedStats.weeklyStats.length - 1]?.completed || 0}
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
                    <BarChart data={selectedStats.weeklyStats}>
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
                    <LineChart data={selectedStats.monthlyStats}>
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
              <Card>
                <CardHeader>
                  <CardTitle>Overall Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Days Tracked:</span>
                      <Badge variant="secondary">{selectedStats.totalDays}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Days Completed:</span>
                      <Badge variant="secondary">{selectedStats.completedDays}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <Badge className="bg-green-500">
                        {selectedStats.completionRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Longest Streak:</span>
                      <Badge className="bg-yellow-500">{selectedStats.longestStreak} days</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
