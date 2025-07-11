
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, BookOpen, Heart, TrendingUp } from 'lucide-react';
import { useDailyReflections } from '../hooks/useDailyReflections';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, isSameDay } from 'date-fns';

interface WellnessData {
  date: string;
  waterIntake: number;
  caloriesIntake: number;
  mood: number;
  sleepHours: number;
  weight: number;
}

export function EnhancedWellnessCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [wellnessData] = useLocalStorage<WellnessData[]>('wellness-data', []);
  const { reflections } = useDailyReflections();

  const getDataForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const wellness = wellnessData.find(w => w.date === dateString);
    const reflection = reflections.find(r => r.reflection_date === dateString);
    
    return { wellness, reflection };
  };

  const hasDataForDate = (date: Date) => {
    const { wellness, reflection } = getDataForDate(date);
    return !!(wellness || reflection);
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 5) return '😊';
    if (mood >= 4) return '🙂';
    if (mood >= 3) return '😐';
    if (mood >= 2) return '😕';
    return '😢';
  };

  const getWellnessScore = (wellness: WellnessData) => {
    let score = 0;
    let factors = 0;
    
    if (wellness.waterIntake > 0) {
      score += Math.min(wellness.waterIntake / 8, 1) * 25; // 25% for water
      factors++;
    }
    
    if (wellness.mood > 0) {
      score += (wellness.mood / 5) * 25; // 25% for mood
      factors++;
    }
    
    if (wellness.sleepHours > 0) {
      score += Math.min(wellness.sleepHours / 8, 1) * 25; // 25% for sleep
      factors++;
    }
    
    if (wellness.caloriesIntake > 0) {
      score += 25; // 25% for tracking calories
      factors++;
    }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Wellness Calendar
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your daily wellness data and reflections
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasData: hasDataForDate
              }}
              modifiersStyles={{
                hasData: {
                  backgroundColor: 'rgb(34, 197, 94)',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Days with wellness data or reflections</span>
              </div>
            </div>
          </div>
          
          {selectedDate && (
            <div className="flex-1 min-w-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const { wellness, reflection } = getDataForDate(selectedDate);
                    
                    if (!wellness && !reflection) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No wellness data or reflections for this date</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-4">
                        {wellness && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Wellness Tracking</h4>
                              <Badge variant="secondary">
                                {getWellnessScore(wellness)}% Complete
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {wellness.waterIntake > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                  <div className="text-blue-500">💧</div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Water</p>
                                    <p className="text-sm font-medium">{wellness.waterIntake} glasses</p>
                                  </div>
                                </div>
                              )}
                              
                              {wellness.caloriesIntake > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                                  <div className="text-orange-500">🍎</div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Calories</p>
                                    <p className="text-sm font-medium">{wellness.caloriesIntake}</p>
                                  </div>
                                </div>
                              )}
                              
                              {wellness.mood > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                  <div className="text-green-500">{getMoodEmoji(wellness.mood)}</div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Mood</p>
                                    <p className="text-sm font-medium">{wellness.mood}/5</p>
                                  </div>
                                </div>
                              )}
                              
                              {wellness.sleepHours > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                                  <div className="text-purple-500">😴</div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Sleep</p>
                                    <p className="text-sm font-medium">{wellness.sleepHours}h</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {reflection && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <h4 className="font-medium">Daily Reflection</h4>
                            </div>
                            
                            <div className="p-3 bg-blue-50 rounded-lg">
                              {reflection.mood && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  <span className="text-sm">Mood: {getMoodEmoji(reflection.mood)} {reflection.mood}/5</span>
                                </div>
                              )}
                              
                              {reflection.content && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Reflection:</p>
                                  <p className="text-sm leading-relaxed">{reflection.content}</p>
                                </div>
                              )}
                              
                              {reflection.tags && reflection.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {reflection.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
