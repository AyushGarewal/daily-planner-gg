
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus, X, Search, BookOpen, TrendingUp } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useDailyReflections } from '../hooks/useDailyReflections';
import { cn } from '@/lib/utils';

export function EnhancedDailyReflectionForm() {
  const { reflections, addReflection, getReflectionByDate, updateReflection } = useDailyReflections();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mood, setMood] = useState<number>(3);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const existingReflection = getReflectionByDate(dateString);

  useEffect(() => {
    if (existingReflection) {
      setMood(existingReflection.mood || 3);
      setContent(existingReflection.content || '');
      setTags(existingReflection.tags || []);
    } else {
      setMood(3);
      setContent('');
      setTags([]);
    }
  }, [existingReflection, selectedDate]);

  const handleSave = async () => {
    const reflectionData = {
      reflection_date: dateString,
      mood,
      content: content.trim(),
      tags
    };

    if (existingReflection) {
      await updateReflection(existingReflection.id, reflectionData);
    } else {
      await addReflection(reflectionData);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Filter reflections based on search
  const filteredReflections = reflections.filter(reflection => 
    reflection.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reflection.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get reflections for calendar view
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getReflectionForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reflections.find(r => r.reflection_date === dateStr);
  };

  const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
  const moodColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-blue-500'];

  // Get popular tags
  const allTags = reflections.flatMap(r => r.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="write" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Write
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Write Reflection Tab */}
        <TabsContent value="write">
          <Card>
            <CardHeader>
              <CardTitle>Daily Reflection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">How was your mood? (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <Button
                      key={value}
                      variant={mood === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMood(value)}
                      className="flex flex-col gap-1 h-16 w-16"
                    >
                      <span className="text-2xl">{moodEmojis[value - 1]}</span>
                      <span className="text-xs">{value}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reflection Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Reflection</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What went well today? What could be improved? Any insights or thoughts..."
                  rows={6}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {/* Popular Tags Quick Add */}
                {popularTags.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-muted-foreground mb-1">Popular tags:</div>
                    <div className="flex flex-wrap gap-1">
                      {popularTags.map(tag => (
                        <Button
                          key={tag}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => !tags.includes(tag) && setTags(prev => [...prev, tag])}
                          disabled={tags.includes(tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                {existingReflection ? 'Update Reflection' : 'Save Reflection'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reflection History</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reflections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredReflections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reflections found</p>
                  </div>
                ) : (
                  filteredReflections.slice(0, 10).map(reflection => (
                    <div 
                      key={reflection.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedDate(parseISO(reflection.reflection_date))}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{reflection.reflection_date}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{moodEmojis[(reflection.mood || 3) - 1]}</span>
                          <span className="text-sm text-muted-foreground">{reflection.mood}/5</span>
                        </div>
                      </div>
                      {reflection.content && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                          {reflection.content}
                        </p>
                      )}
                      {reflection.tags && reflection.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {reflection.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reflection Calendar</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium min-w-[100px] text-center">
                    {format(selectedMonth, 'MMM yyyy')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map(date => {
                    const reflection = getReflectionForDay(date);
                    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    
                    return (
                      <div
                        key={date.toISOString()}
                        className={cn(
                          "min-h-[60px] p-2 border rounded-lg cursor-pointer transition-colors relative",
                          isToday && "ring-2 ring-blue-500",
                          reflection ? "bg-green-50 hover:bg-green-100" : "hover:bg-muted/50"
                        )}
                        onClick={() => {
                          setSelectedDate(date);
                          // Switch to write tab
                          const tabs = document.querySelector('[role="tablist"]');
                          const writeTab = tabs?.querySelector('[value="write"]') as HTMLElement;
                          writeTab?.click();
                        }}
                      >
                        <div className="text-sm font-medium">{format(date, 'd')}</div>
                        {reflection && (
                          <div className="absolute bottom-1 right-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{moodEmojis[(reflection.mood || 3) - 1]}</span>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {monthDays.filter(date => getReflectionForDay(date)).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Days Reflected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {monthDays.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round((monthDays.filter(date => getReflectionForDay(date)).length / monthDays.length) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {reflections.length > 0 ? Math.round(reflections.reduce((sum, r) => sum + (r.mood || 3), 0) / reflections.length * 10) / 10 : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Mood</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
