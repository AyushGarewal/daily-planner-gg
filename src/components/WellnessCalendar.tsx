
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight, Heart, BookOpen, Zap, Droplets, Flame } from 'lucide-react';
import { useMoodTracker } from '../hooks/useMoodTracker';
import { useDailyReflections } from '../hooks/useDailyReflections';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  isToday
} from 'date-fns';

interface WellnessEntry {
  id: string;
  date: string;
  waterIntake: number;
  calorieIntake: number;
  createdAt: Date;
  updatedAt: Date;
}

export function WellnessCalendar() {
  const { moodEntries } = useMoodTracker();
  const { reflections } = useDailyReflections();
  const [wellnessEntries] = useLocalStorage<WellnessEntry[]>('wellnessEntries', []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  
  // Create full calendar grid (6 weeks)
  const calendarDays: Date[] = [];
  let currentCalendarDate = new Date(calendarStart);
  
  for (let week = 0; week < 6; week++) {
    for (let day = 0; day < 7; day++) {
      calendarDays.push(new Date(currentCalendarDate));
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
  }

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayMoodEntries = moodEntries.filter(entry => 
      new Date(entry.date).toDateString() === date.toDateString()
    );
    const dayReflection = reflections.find(entry => 
      new Date(entry.reflection_date).toDateString() === date.toDateString()
    );
    const dayWellness = wellnessEntries.find(entry => entry.date === dateStr);

    const avgMood = dayMoodEntries.length > 0 
      ? dayMoodEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayMoodEntries.length 
      : 0;
    
    const avgEnergy = dayMoodEntries.length > 0 
      ? dayMoodEntries.reduce((sum, entry) => sum + entry.energy, 0) / dayMoodEntries.length 
      : 0;

    return {
      moodEntries: dayMoodEntries,
      reflection: dayReflection,
      wellness: dayWellness,
      avgMood: Math.round(avgMood * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      hasData: dayMoodEntries.length > 0 || !!dayReflection || !!dayWellness
    };
  };

  const getMoodColor = (mood: number) => {
    if (mood === 0) return 'bg-gray-200';
    if (mood <= 2) return 'bg-red-400';
    if (mood === 3) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getEnergyColor = (energy: number) => {
    if (energy === 0) return 'bg-gray-200';
    if (energy <= 2) return 'bg-orange-400';
    if (energy === 3) return 'bg-blue-400';
    return 'bg-purple-400';
  };

  const getWaterProgress = (waterIntake: number) => {
    const goal = 2000; // ml
    return Math.min((waterIntake / goal) * 100, 100);
  };

  const getCalorieProgress = (calorieIntake: number) => {
    const goal = 2200; // calories
    return Math.min((calorieIntake / goal) * 100, 100);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const selectedDateData = selectedDate ? getDayData(selectedDate) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Wellness Calendar
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>Good Mood</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Neutral Mood</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>Low Mood</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-purple-400 rounded"></div>
              <span>High Energy</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>Water Goal</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Calorie Goal</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>Has Reflection</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dayData = getDayData(date);
                const todayClass = isToday(date) ? 'ring-2 ring-blue-500' : '';
                const isCurrentMonth = isSameMonth(date, currentDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      relative h-20 w-full rounded-lg text-xs font-medium transition-all duration-200
                      hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${todayClass} border border-gray-200
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50'}
                    `}
                  >
                    <div className="p-1 h-full flex flex-col">
                      <span className="text-gray-700">{format(date, 'd')}</span>
                      
                      {dayData.hasData && (
                        <div className="flex-1 flex flex-col gap-1 mt-1">
                          {dayData.avgMood > 0 && (
                            <div className={`h-1 w-full rounded ${getMoodColor(dayData.avgMood)}`} 
                                 title={`Mood: ${dayData.avgMood}`}></div>
                          )}
                          {dayData.avgEnergy > 0 && (
                            <div className={`h-1 w-full rounded ${getEnergyColor(dayData.avgEnergy)}`}
                                 title={`Energy: ${dayData.avgEnergy}`}></div>
                          )}
                          
                          {/* Water and Calorie indicators */}
                          <div className="flex gap-1">
                            {dayData.wellness?.waterIntake && (
                              <div className="flex-1">
                                <div className="h-1 bg-blue-200 rounded overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${getWaterProgress(dayData.wellness.waterIntake)}%` }}
                                    title={`Water: ${dayData.wellness.waterIntake}ml`}
                                  ></div>
                                </div>
                              </div>
                            )}
                            {dayData.wellness?.calorieIntake && (
                              <div className="flex-1">
                                <div className="h-1 bg-orange-200 rounded overflow-hidden">
                                  <div 
                                    className="h-full bg-orange-500" 
                                    style={{ width: `${getCalorieProgress(dayData.wellness.calorieIntake)}%` }}
                                    title={`Calories: ${dayData.wellness.calorieIntake}`}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {dayData.reflection && (
                            <div className="flex justify-center">
                              <BookOpen className="h-3 w-3 text-blue-500" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDateData?.hasData ? (
              <div className="space-y-4">
                {/* Mood & Energy */}
                {selectedDateData.moodEntries.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      Mood & Energy
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">{selectedDateData.avgMood}</div>
                        <div className="text-xs text-muted-foreground">Avg Mood</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">{selectedDateData.avgEnergy}</div>
                        <div className="text-xs text-muted-foreground">Avg Energy</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {selectedDateData.moodEntries.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{entry.timeOfDay}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">Mood: {entry.mood}</Badge>
                            <Badge variant="outline">Energy: {entry.energy}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wellness Data */}
                {selectedDateData.wellness && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Wellness Tracking
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-muted rounded">
                        <Droplets className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                        <div className="text-lg font-bold">{selectedDateData.wellness.waterIntake}ml</div>
                        <div className="text-xs text-muted-foreground">Water</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                        <div className="text-lg font-bold">{selectedDateData.wellness.calorieIntake}</div>
                        <div className="text-xs text-muted-foreground">Calories</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reflection */}
                {selectedDateData.reflection && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      Daily Reflection
                    </h4>
                    {selectedDateData.reflection.content && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{selectedDateData.reflection.content}</p>
                      </div>
                    )}
                    {selectedDateData.reflection.mood && (
                      <div className="text-sm">
                        <strong>Mood Rating:</strong> {selectedDateData.reflection.mood}/5
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No wellness data for this date</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
