
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Target, Link as LinkIcon, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { useTasks } from '../hooks/useTasks';
import { cn } from '@/lib/utils';

interface ChallengeFormProps {
  onSubmit: (challengeData: any) => void;
  onCancel: () => void;
  initialChallenge?: any;
}

export function ChallengeForm({ onSubmit, onCancel, initialChallenge }: ChallengeFormProps) {
  const { tasks } = useTasks();
  
  const [title, setTitle] = useState(initialChallenge?.title || '');
  const [description, setDescription] = useState(initialChallenge?.description || '');
  const [badgeName, setBadgeName] = useState(initialChallenge?.badge_name || '');
  const [xpReward, setXpReward] = useState(initialChallenge?.xp_reward || 100);
  const [startDate, setStartDate] = useState<Date>(
    initialChallenge?.start_date ? new Date(initialChallenge.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialChallenge?.end_date ? new Date(initialChallenge.end_date) : undefined
  );
  const [conditionType, setConditionType] = useState(initialChallenge?.condition_type || 'streak');
  const [conditionTarget, setConditionTarget] = useState(initialChallenge?.condition_target || 7);
  const [conditionDuration, setConditionDuration] = useState(initialChallenge?.condition_duration || 7);
  
  // New habit linking fields
  const [linkedHabitId, setLinkedHabitId] = useState(initialChallenge?.linked_habit_id || '');
  const [useSpecificHabit, setUseSpecificHabit] = useState(!!initialChallenge?.linked_habit_id);
  
  const availableHabits = tasks.filter(task => task.type === 'habit')
    .reduce((acc, task) => {
      const existing = acc.find(h => h.title === task.title && h.category === task.category && h.recurrence === task.recurrence);
      if (!existing) {
        acc.push(task);
      }
      return acc;
    }, [] as any[]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const challengeData = {
      title: title.trim(),
      description: description.trim(),
      badge_name: badgeName.trim(),
      xp_reward: xpReward,
      start_date: startDate,
      end_date: endDate,
      condition_type: conditionType,
      condition_target: conditionTarget,
      condition_duration: conditionDuration,
      linked_habit_id: useSpecificHabit ? linkedHabitId : undefined,
      progress: 0,
      is_completed: false,
    };

    onSubmit(challengeData);
  };

  const getConditionDescription = () => {
    const linkedHabit = availableHabits.find(h => h.id === linkedHabitId);
    const habitName = linkedHabit?.title || 'any habit';
    
    switch (conditionType) {
      case 'streak':
        return useSpecificHabit 
          ? `Complete "${habitName}" for ${conditionTarget} consecutive days`
          : `Maintain daily streak for ${conditionTarget} consecutive days`;
      case 'total_completions':
        return useSpecificHabit
          ? `Complete "${habitName}" ${conditionTarget} times total`
          : `Complete ${conditionTarget} tasks/habits total`;
      case 'weekly_target':
        return useSpecificHabit
          ? `Complete "${habitName}" ${conditionTarget} times per week for ${conditionDuration} weeks`
          : `Complete ${conditionTarget} tasks/habits per week for ${conditionDuration} weeks`;
      case 'xp_target':
        return `Earn ${conditionTarget} XP total`;
      default:
        return 'Complete the challenge';
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Challenge Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter challenge name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the challenge"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge Name</label>
              <Input
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                placeholder="e.g., Streak Master"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">XP Reward</label>
              <Input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                min="1"
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Challenge Condition Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Challenge Condition
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">Condition Type</label>
              <Select value={conditionType} onValueChange={setConditionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streak">Daily Streak</SelectItem>
                  <SelectItem value="total_completions">Total Completions</SelectItem>
                  <SelectItem value="weekly_target">Weekly Target</SelectItem>
                  <SelectItem value="xp_target">XP Target</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {conditionType === 'xp_target' ? 'Target XP' : 'Target Number'}
                </label>
                <Input
                  type="number"
                  value={conditionTarget}
                  onChange={(e) => setConditionTarget(parseInt(e.target.value) || 0)}
                  min="1"
                  placeholder="7"
                />
              </div>
              
              {conditionType === 'weekly_target' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (weeks)</label>
                  <Input
                    type="number"
                    value={conditionDuration}
                    onChange={(e) => setConditionDuration(parseInt(e.target.value) || 0)}
                    min="1"
                    placeholder="4"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Habit Linking Section */}
          {conditionType !== 'xp_target' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Habit Tracking
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="general-tracking"
                    checked={!useSpecificHabit}
                    onCheckedChange={() => setUseSpecificHabit(false)}
                  />
                  <label htmlFor="general-tracking" className="text-sm">
                    Track with general daily completion
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="specific-habit"
                    checked={useSpecificHabit}
                    onCheckedChange={() => setUseSpecificHabit(true)}
                  />
                  <label htmlFor="specific-habit" className="text-sm">
                    Track with specific habit
                  </label>
                </div>

                {useSpecificHabit && availableHabits.length > 0 && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium mb-1">Select Habit</label>
                    <Select value={linkedHabitId} onValueChange={setLinkedHabitId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a habit to track" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableHabits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.id || 'none'}>
                            <div className="flex items-center justify-between w-full">
                              <span>{habit.title}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {habit.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {useSpecificHabit && availableHabits.length === 0 && (
                  <div className="ml-6 text-sm text-muted-foreground p-2 bg-yellow-50 rounded border-l-2 border-yellow-200">
                    No habits available. Create some habits first to link them to challenges.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Challenge Preview */}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Challenge Preview</span>
            </div>
            <p className="text-sm text-blue-800">{getConditionDescription()}</p>
            <p className="text-xs text-blue-600 mt-1">
              Reward: {xpReward} XP{badgeName && ` + "${badgeName}" badge`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {initialChallenge ? 'Update Challenge' : 'Create Challenge'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
