
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useDailyReflections } from '../hooks/useDailyReflections';
import { cn } from '@/lib/utils';

export function DailyReflectionForm() {
  const { reflections, addReflection, getReflectionByDate, updateReflection } = useDailyReflections();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mood, setMood] = useState<number>(3);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

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

  const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];

  return (
    <div className="space-y-6">
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
                  className="flex flex-col gap-1"
                >
                  <span className="text-lg">{moodEmojis[value - 1]}</span>
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
              rows={4}
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

      {/* Recent Reflections */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reflections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reflections.slice(0, 5).map(reflection => (
              <div key={reflection.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{reflection.reflection_date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{moodEmojis[(reflection.mood || 3) - 1]}</span>
                    <span className="text-sm text-muted-foreground">{reflection.mood}/5</span>
                  </div>
                </div>
                {reflection.content && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
