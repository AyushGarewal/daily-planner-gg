
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { format, subDays, eachDayOfInterval, isToday, isWithinInterval } from 'date-fns';

export function HabitHeatmap() {
  const { tasks } = useTasks();
  
  // Generate last 30 days
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29);
  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

  // Calculate task completion for each day
  const dayData = days.map(day => {
    const dayStr = day.toDateString();
    const dayTasks = tasks.filter(task => 
      new Date(task.dueDate).toDateString() === dayStr
    );
    const completedTasks = dayTasks.filter(task => task.completed);
    
    return {
      date: day,
      totalTasks: dayTasks.length,
      completedTasks: completedTasks.length,
      completionRate: dayTasks.length > 0 ? completedTasks.length / dayTasks.length : 0
    };
  });

  // Get intensity color based on completion rate
  const getIntensityColor = (completionRate: number, totalTasks: number) => {
    if (totalTasks === 0) return 'bg-gray-100'; // No tasks
    if (completionRate === 0) return 'bg-red-100'; // No completion
    if (completionRate < 0.5) return 'bg-orange-200'; // Low completion
    if (completionRate < 0.8) return 'bg-yellow-300'; // Medium completion
    if (completionRate < 1) return 'bg-green-300'; // High completion
    return 'bg-green-500'; // Perfect completion
  };

  // Split days into weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Calculate statistics
  const totalDaysWithTasks = dayData.filter(d => d.totalTasks > 0).length;
  const perfectDays = dayData.filter(d => d.completedTasks > 0 && d.completionRate === 1).length;
  const averageCompletion = totalDaysWithTasks > 0 
    ? Math.round((dayData.reduce((sum, d) => sum + d.completionRate, 0) / totalDaysWithTasks) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          30-Day Habit Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{perfectDays}</div>
            <div className="text-xs text-muted-foreground">Perfect Days</div>
          </div>
          <div className="p-3 bg-secondary/5 rounded-lg">
            <div className="text-2xl font-bold text-secondary">{averageCompletion}%</div>
            <div className="text-xs text-muted-foreground">Avg Completion</div>
          </div>
          <div className="p-3 bg-yellow-500/5 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalDaysWithTasks}</div>
            <div className="text-xs text-muted-foreground">Active Days</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Daily Task Completion</div>
          
          {/* Week labels */}
          <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center mb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  const dayInfo = dayData.find(d => d.date.toDateString() === day.toDateString());
                  const intensity = dayInfo ? getIntensityColor(dayInfo.completionRate, dayInfo.totalTasks) : 'bg-gray-100';
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        aspect-square rounded-sm ${intensity} border border-gray-200 
                        hover:ring-2 hover:ring-primary cursor-pointer
                        ${isToday(day) ? 'ring-2 ring-blue-500' : ''}
                        relative group
                      `}
                      title={`${format(day, 'MMM dd')}: ${dayInfo?.completedTasks || 0}/${dayInfo?.totalTasks || 0} tasks`}
                    >
                      {/* Tooltip content */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                        {format(day, 'MMM dd')}: {dayInfo?.completedTasks || 0}/{dayInfo?.totalTasks || 0} tasks
                        {dayInfo && dayInfo.totalTasks > 0 && (
                          <div>{Math.round(dayInfo.completionRate * 100)}% complete</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-red-100 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-orange-200 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-yellow-300 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-green-300 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm border border-gray-200"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Monthly streak info */}
        <div className="text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Today:</span> {
              dayData.find(d => isToday(d.date))?.completedTasks || 0
            } tasks completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
