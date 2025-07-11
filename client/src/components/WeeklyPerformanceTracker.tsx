
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMoodTracker } from '../hooks/useMoodTracker';
import { useTasks } from '../hooks/useTasks';
import { format, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface WeeklyScore {
  weekStart: Date;
  weekEnd: Date;
  completionRate: number;
  averageMood: number;
  averageEnergy: number;
  streakLength: number;
  score: number;
}

export function WeeklyPerformanceTracker() {
  const [weeklyScores, setWeeklyScores] = useLocalStorage<WeeklyScore[]>('weeklyScores', []);
  const { getWeeklyMoodData } = useMoodTracker();
  const { tasks, progress } = useTasks();

  const calculateWeeklyScore = (weekStart: Date, weekEnd: Date): WeeklyScore => {
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Calculate completion rate
    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });
    const completedTasks = weekTasks.filter(task => task.completed);
    const completionRate = weekTasks.length > 0 ? (completedTasks.length / weekTasks.length) * 100 : 0;

    // Get mood data for the week
    const weekMoodData = getWeeklyMoodData().filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    const averageMood = weekMoodData.length > 0 
      ? weekMoodData.reduce((sum, entry) => sum + entry.mood, 0) / weekMoodData.length
      : 0;

    const averageEnergy = weekMoodData.length > 0 
      ? weekMoodData.reduce((sum, entry) => sum + entry.energy, 0) / weekMoodData.length
      : 0;

    // Use current streak length (simplified)
    const streakLength = progress.currentStreak;

    // Calculate performance score: (Completion% + Mood + Energy + (Streak × 2)) ÷ 4
    const score = (completionRate + (averageMood * 20) + (averageEnergy * 20) + (streakLength * 2)) / 4;

    return {
      weekStart,
      weekEnd,
      completionRate: Math.round(completionRate),
      averageMood: Math.round(averageMood * 10) / 10,
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      streakLength,
      score: Math.round(score)
    };
  };

  // Generate scores for the last 4 weeks if not already stored
  React.useEffect(() => {
    const today = new Date();
    const fourWeeksAgo = subWeeks(today, 4);
    
    const missingWeeks: WeeklyScore[] = [];
    
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      const existingScore = weeklyScores.find(score => 
        score.weekStart.toString() === weekStart.toString()
      );
      
      if (!existingScore) {
        missingWeeks.push(calculateWeeklyScore(weekStart, weekEnd));
      }
    }
    
    if (missingWeeks.length > 0) {
      setWeeklyScores(prev => [...prev, ...missingWeeks].slice(-4));
    }
  }, [tasks, weeklyScores, setWeeklyScores]);

  const chartData = weeklyScores
    .slice(-4)
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime())
    .map(week => ({
      week: format(new Date(week.weekStart), 'MMM dd'),
      score: week.score,
      completion: week.completionRate,
      mood: week.averageMood * 20, // Scale to 0-100
      energy: week.averageEnergy * 20, // Scale to 0-100
      streak: week.streakLength * 5 // Scale for visibility
    }));

  const chartConfig = {
    score: {
      label: "Weekly Score",
      color: "hsl(var(--primary))",
    },
    completion: {
      label: "Completion %",
      color: "hsl(var(--secondary))",
    },
    mood: {
      label: "Mood Score",
      color: "hsl(var(--accent))",
    },
    energy: {
      label: "Energy Score", 
      color: "hsl(142 76% 36%)",
    }
  };

  const currentWeekScore = weeklyScores.length > 0 ? weeklyScores[weeklyScores.length - 1]?.score || 0 : 0;
  const previousWeekScore = weeklyScores.length > 1 ? weeklyScores[weeklyScores.length - 2]?.score || 0 : 0;
  const trend = currentWeekScore - previousWeekScore;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Weekly Performance Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{currentWeekScore}</div>
              <div className="text-sm text-muted-foreground">This Week's Score</div>
              {trend !== 0 && (
                <div className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '↗' : '↘'} {Math.abs(trend)} from last week
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <div className="text-3xl font-bold text-secondary">
                {weeklyScores.length > 0 ? Math.max(...weeklyScores.map(w => w.score)) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Best Score</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/5 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {weeklyScores.length > 0 ? Math.round(weeklyScores.reduce((sum, w) => sum + w.score, 0) / weeklyScores.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
          </div>

          {/* Score Trend Chart */}
          {chartData.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">4-Week Performance Trend</h3>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="var(--color-score)" 
                      strokeWidth={3}
                      name="Weekly Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="var(--color-completion)" 
                      strokeWidth={2}
                      name="Completion %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}

          {/* Detailed Breakdown */}
          {weeklyScores.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Recent Weeks Breakdown</h3>
              <div className="space-y-3">
                {weeklyScores.slice(-2).reverse().map((week, index) => (
                  <div key={week.weekStart.toString()} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">
                        {format(new Date(week.weekStart), 'MMM dd')} - {format(new Date(week.weekEnd), 'MMM dd')}
                      </span>
                      <span className="text-2xl font-bold text-primary">{week.score}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Completion</div>
                        <div className="font-medium">{week.completionRate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Mood</div>
                        <div className="font-medium">{week.averageMood}/5</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Energy</div>
                        <div className="font-medium">{week.averageEnergy}/5</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Streak</div>
                        <div className="font-medium">{week.streakLength} days</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
