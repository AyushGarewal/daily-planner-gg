
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, Award, Target, BarChart3, Flame, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, subDays, getDay, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { useTasks } from '../hooks/useTasks';

interface DetailedHabitStats {
  habitName: string;
  creationDate: Date;
  totalScheduledDays: number;
  completedDays: number;
  consistencyRate: number;
  currentStreak: number;
  longestStreak: number;
  missRate: number;
  adherenceScore: number;
  momentumScore: number;
  trendScore: number;
  weeklyData: Array<{
    week: string;
    completion: number;
    scheduled: number;
    rate: number;
  }>;
  monthlyData: Array<{
    month: string;
    completion: number;
    scheduled: number;
    rate: number;
  }>;
  dailyData: Array<{
    date: string;
    completed: boolean;
    scheduled: boolean;
    dayOfWeek: number;
  }>;
}

export function HabitPerformanceTracker() {
  const { tasks, getUserHabits } = useTasks();
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('all');
  
  const userHabits = getUserHabits();
  
  // Set default selected habit if none selected
  React.useEffect(() => {
    if (userHabits.length > 0 && !selectedHabit) {
      setSelectedHabit(userHabits[0].id);
    }
  }, [userHabits, selectedHabit]);

  const calculateDetailedHabitStats = (habitId: string): DetailedHabitStats => {
    const baseHabit = userHabits.find(h => h.id === habitId);
    if (!baseHabit) {
      return {
        habitName: '',
        creationDate: new Date(),
        totalScheduledDays: 0,
        completedDays: 0,
        consistencyRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        missRate: 0,
        adherenceScore: 0,
        momentumScore: 0,
        trendScore: 0,
        weeklyData: [],
        monthlyData: [],
        dailyData: []
      };
    }

    const creationDate = startOfDay(new Date(baseHabit.dueDate));
    const today = startOfDay(new Date());
    
    // Get all instances of this habit (including recurring ones)
    const habitInstances = tasks.filter(task => 
      task.type === 'habit' && 
      task.title === baseHabit.title && 
      task.category === baseHabit.category &&
      !isBefore(new Date(task.dueDate), creationDate) // Only count from creation date forward
    );

    // Calculate daily data from creation date to today
    const daysSinceCreation = differenceInDays(today, creationDate);
    const dailyData = [];
    
    for (let i = 0; i <= daysSinceCreation; i++) {
      const currentDate = new Date(creationDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dayOfWeek = getDay(currentDate);
      let shouldBeScheduled = false;
      
      // Determine if this day should have the habit based on recurrence
      if (baseHabit.recurrence === 'Daily') {
        shouldBeScheduled = true;
      } else if (baseHabit.recurrence === 'Weekly' && baseHabit.weekDays) {
        shouldBeScheduled = baseHabit.weekDays.includes(dayOfWeek);
      }
      
      const instance = habitInstances.find(task => 
        isSameDay(new Date(task.dueDate), currentDate)
      );
      
      dailyData.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        completed: instance?.completed || false,
        scheduled: shouldBeScheduled,
        dayOfWeek
      });
    }

    // Calculate basic metrics
    const scheduledDays = dailyData.filter(d => d.scheduled);
    const completedScheduledDays = dailyData.filter(d => d.scheduled && d.completed);
    
    const totalScheduledDays = scheduledDays.length;
    const completedDays = completedScheduledDays.length;
    const consistencyRate = totalScheduledDays > 0 ? (completedDays / totalScheduledDays) * 100 : 0;
    const missRate = totalScheduledDays > 0 ? ((totalScheduledDays - completedDays) / totalScheduledDays) * 100 : 0;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate current streak from most recent days
    const recentScheduledDays = dailyData.filter(d => d.scheduled).reverse();
    for (const day of recentScheduledDays) {
      if (day.completed) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    for (const day of dailyData.filter(d => d.scheduled)) {
      if (day.completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate adherence score (how well the habit is done on intended days)
    const adherenceScore = consistencyRate;

    // Calculate momentum score (recent performance weighted)
    const recentDays = dailyData.slice(-7).filter(d => d.scheduled);
    const recentCompletionRate = recentDays.length > 0 
      ? (recentDays.filter(d => d.completed).length / recentDays.length) * 100 
      : 0;
    const momentumScore = Math.round((consistencyRate * 0.7) + (recentCompletionRate * 0.3));

    // Calculate trend score (improvement over time)
    const firstHalf = dailyData.slice(0, Math.floor(dailyData.length / 2)).filter(d => d.scheduled);
    const secondHalf = dailyData.slice(Math.floor(dailyData.length / 2)).filter(d => d.scheduled);
    
    const firstHalfRate = firstHalf.length > 0 ? (firstHalf.filter(d => d.completed).length / firstHalf.length) * 100 : 0;
    const secondHalfRate = secondHalf.length > 0 ? (secondHalf.filter(d => d.completed).length / secondHalf.length) * 100 : 0;
    const trendScore = Math.round(secondHalfRate - firstHalfRate);

    // Calculate weekly data
    const weeklyData = [];
    for (let i = 0; i < 8; i++) {
      const weekStart = startOfWeek(subDays(today, i * 7));
      const weekEnd = endOfWeek(weekStart);
      
      const weekDays = dailyData.filter(d => {
        const dayDate = parseISO(d.date);
        return dayDate >= weekStart && dayDate <= weekEnd && d.scheduled;
      });
      
      const weekCompleted = weekDays.filter(d => d.completed);
      
      weeklyData.unshift({
        week: format(weekStart, 'MMM dd'),
        completion: weekCompleted.length,
        scheduled: weekDays.length,
        rate: weekDays.length > 0 ? (weekCompleted.length / weekDays.length) * 100 : 0
      });
    }

    // Calculate monthly data
    const monthlyData = [];
    for (let i = 0; i < 3; i++) {
      const monthStart = startOfMonth(subDays(today, i * 30));
      const monthEnd = endOfMonth(monthStart);
      
      const monthDays = dailyData.filter(d => {
        const dayDate = parseISO(d.date);
        return dayDate >= monthStart && dayDate <= monthEnd && d.scheduled;
      });
      
      const monthCompleted = monthDays.filter(d => d.completed);
      
      monthlyData.unshift({
        month: format(monthStart, 'MMM yyyy'),
        completion: monthCompleted.length,
        scheduled: monthDays.length,
        rate: monthDays.length > 0 ? (monthCompleted.length / monthDays.length) * 100 : 0
      });
    }

    return {
      habitName: baseHabit.title,
      creationDate,
      totalScheduledDays,
      completedDays,
      consistencyRate: Math.round(consistencyRate),
      currentStreak,
      longestStreak,
      missRate: Math.round(missRate),
      adherenceScore: Math.round(adherenceScore),
      momentumScore,
      trendScore,
      weeklyData,
      monthlyData,
      dailyData
    };
  };

  const renderCalendarHeatmap = (stats: DetailedHabitStats) => {
    const last30Days = stats.dailyData.slice(-30);

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium">30-Day Calendar Heatmap</h4>
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-xs text-center p-1 text-muted-foreground font-medium">
              {day}
            </div>
          ))}
          {last30Days.map((day, index) => {
            let bgColor = 'bg-gray-100 dark:bg-gray-800'; // Not scheduled
            
            if (day.scheduled) {
              if (day.completed) {
                bgColor = 'bg-green-500 text-white';
              } else {
                bgColor = 'bg-red-200 dark:bg-red-900/30';
              }
            }
            
            return (
              <div
                key={index}
                className={`aspect-square rounded text-xs flex items-center justify-center ${bgColor} border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:scale-110`}
                title={`${format(parseISO(day.date), 'MMM dd')} - ${day.scheduled ? (day.completed ? 'Completed' : 'Missed') : 'Not scheduled'}`}
              >
                {format(parseISO(day.date), 'd')}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm" title="Not scheduled"></div>
            <div className="w-3 h-3 bg-red-200 dark:bg-red-900/30 rounded-sm" title="Missed"></div>
            <div className="w-3 h-3 bg-green-300 rounded-sm" title="Completed"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm" title="Perfect"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    );
  };

  if (userHabits.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No habits to track
          </h3>
          <p className="text-sm text-muted-foreground">
            Create some habits to see detailed performance insights!
          </p>
        </div>
      </div>
    );
  }

  const selectedStats = selectedHabit ? calculateDetailedHabitStats(selectedHabit) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Habit Performance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Detailed analytics and insights for your habits
          </p>
        </div>
        
        <Select value={selectedHabit} onValueChange={setSelectedHabit}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select habit" />
          </SelectTrigger>
          <SelectContent>
            {userHabits.map(habit => (
              <SelectItem key={habit.id} value={habit.id}>
                {habit.title}
                {habit.isRoutine && <span className="ml-2 text-xs text-blue-600">(Routine)</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStats && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Consistency</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {selectedStats.consistencyRate}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedStats.completedDays}/{selectedStats.totalScheduledDays} days
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {selectedStats.currentStreak}
                </div>
                <div className="text-xs text-muted-foreground">
                  Best: {selectedStats.longestStreak} days
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Miss Rate</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {selectedStats.missRate}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Room for improvement
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Momentum</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedStats.momentumScore}
                </div>
                <div className="text-xs text-muted-foreground">
                  Trend: {selectedStats.trendScore > 0 ? '+' : ''}{selectedStats.trendScore}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Calendar Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCalendarHeatmap(selectedStats)}
            </CardContent>
          </Card>

          {/* Performance Charts */}
          <Tabs value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Weekly</TabsTrigger>
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value="week" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>8-Week Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={selectedStats.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                      <Area type="monotone" dataKey="rate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>3-Month Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={selectedStats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                      <Bar dataKey="rate" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Habit Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <Badge variant="outline">
                        {format(selectedStats.creationDate, 'MMM dd, yyyy')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Days Active:</span>
                      <Badge variant="secondary">
                        {Math.ceil((new Date().getTime() - selectedStats.creationDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Adherence Score:</span>
                      <Badge className="bg-blue-500">
                        {selectedStats.adherenceScore}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Longest Streak:</span>
                      <Badge className="bg-orange-500">
                        {selectedStats.longestStreak} days
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Consistency Rate</span>
                        <span className="font-medium">{selectedStats.consistencyRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${selectedStats.consistencyRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Momentum Score</span>
                        <span className="font-medium">{selectedStats.momentumScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${selectedStats.momentumScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
