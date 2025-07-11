
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useMoodTracker } from '../hooks/useMoodTracker';
import { useTasks } from '../hooks/useTasks';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function ProductivityChart() {
  const { getWeeklyMoodData } = useMoodTracker();
  const { tasks } = useTasks();

  const weeklyMoodData = getWeeklyMoodData();
  
  // Generate last 7 days
  const today = new Date();
  const weekAgo = subDays(today, 6);
  const days = eachDayOfInterval({ start: weekAgo, end: today });

  const chartData = days.map(day => {
    const dayStr = day.toDateString();
    
    // Get mood and energy averages for the day
    const dayMoodEntries = weeklyMoodData.filter(entry => 
      new Date(entry.date).toDateString() === dayStr
    );
    
    const avgMood = dayMoodEntries.length > 0 
      ? dayMoodEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayMoodEntries.length
      : 0;
    
    const avgEnergy = dayMoodEntries.length > 0 
      ? dayMoodEntries.reduce((sum, entry) => sum + entry.energy, 0) / dayMoodEntries.length
      : 0;

    // Get productivity metrics for the day
    const dayTasks = tasks.filter(task => 
      new Date(task.dueDate).toDateString() === dayStr
    );
    
    const completedTasks = dayTasks.filter(task => task.completed);
    const completionRate = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
    const xpEarned = completedTasks.reduce((sum, task) => sum + task.xpValue, 0);

    return {
      date: format(day, 'MMM dd'),
      mood: Math.round(avgMood * 10) / 10, // Round to 1 decimal
      energy: Math.round(avgEnergy * 10) / 10,
      completionRate: Math.round(completionRate),
      xpEarned,
    };
  });

  const chartConfig = {
    mood: {
      label: "Mood",
      color: "hsl(var(--primary))",
    },
    energy: {
      label: "Energy", 
      color: "hsl(var(--secondary))",
    },
    completionRate: {
      label: "Task Completion %",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Mood & Productivity Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Mood & Energy vs Task Completion</h3>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="var(--color-mood)" 
                    strokeWidth={2}
                    name="Mood (1-5)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="var(--color-energy)" 
                    strokeWidth={2}
                    name="Energy (1-5)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    stroke="var(--color-completionRate)" 
                    strokeWidth={2}
                    name="Completion %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round((chartData.reduce((sum, day) => sum + day.mood, 0) / chartData.filter(day => day.mood > 0).length) * 10) / 10 || 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg Mood</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">
                {Math.round((chartData.reduce((sum, day) => sum + day.energy, 0) / chartData.filter(day => day.energy > 0).length) * 10) / 10 || 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg Energy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {Math.round(chartData.reduce((sum, day) => sum + day.completionRate, 0) / chartData.length)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Completion</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
