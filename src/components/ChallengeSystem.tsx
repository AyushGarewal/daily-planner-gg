
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, Plus, Target, Calendar, RotateCcw, CheckCircle, X, Zap } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTasks } from '../hooks/useTasks';
import { useXPSystem } from '../hooks/useXPSystem';
import { Task } from '../types/task';
import { SideHabit, NegativeHabit } from '../types/sideHabits';

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  badgeReward?: string;
  timeLimit: number; // days
  targetValue: number;
  linkedHabits: string[]; // habit IDs
  challengeType: 'streak' | 'frequency' | 'milestone' | 'avoidance' | 'completion' | 'combo';
  habitTypes: ('normal' | 'side' | 'negative')[]; // which types of habits are linked
  progress: number;
  isCompleted: boolean;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  completedAt?: Date;
  dailyProgress: { [date: string]: number }; // track daily progress
}

const CHALLENGE_TYPES = [
  {
    id: 'streak',
    name: 'Streak Challenge',
    description: 'Maintain a streak on linked habit(s) for consecutive days'
  },
  {
    id: 'frequency',
    name: 'Frequency Challenge', 
    description: 'Complete the linked habit(s) a certain number of times within the timeframe'
  },
  {
    id: 'milestone',
    name: 'Milestone Challenge',
    description: 'Reach a cumulative numeric goal from the linked habit(s)'
  },
  {
    id: 'avoidance',
    name: 'Avoidance Challenge',
    description: 'Avoid a specific negative habit for the specified days'
  },
  {
    id: 'completion',
    name: 'Completion % Challenge',
    description: 'Maintain at least X% daily completion rate for specified days'
  },
  {
    id: 'combo',
    name: 'Combo Challenge',
    description: 'Complete multiple habits on the same day for specified days'
  }
];

export function ChallengeSystem() {
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>('challenges-system', []);
  const [sideHabits, setSideHabits] = useLocalStorage<SideHabit[]>('side-habits', []);
  const [negativeHabits, setNegativeHabits] = useLocalStorage<NegativeHabit[]>('negative-habits', []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [selectedHabitTypes, setSelectedHabitTypes] = useState<('normal' | 'side' | 'negative')[]>([]);
  const { tasks } = useTasks();
  const { awardXP } = useXPSystem();

  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    xpReward: 100,
    badgeReward: '',
    timeLimit: 7,
    targetValue: 7,
    challengeType: 'streak' as Challenge['challengeType']
  });

  // Get all available habits by type
  const normalHabits = tasks.filter(task => task.type === 'habit');
  const allHabits = [
    ...normalHabits.map(h => ({ ...h, habitType: 'normal' as const })),
    ...sideHabits.map(h => ({ ...h, habitType: 'side' as const })),
    ...negativeHabits.map(h => ({ ...h, habitType: 'negative' as const }))
  ];

  // Auto-track challenges based on daily activity
  useEffect(() => {
    const updateChallengeProgress = () => {
      const today = new Date().toDateString();
      
      setChallenges(prev => prev.map(challenge => {
        if (challenge.isCompleted || !challenge.isActive) return challenge;
        
        let newProgress = challenge.progress;
        const linkedHabits = allHabits.filter(h => challenge.linkedHabits.includes(h.id));
        
        switch (challenge.challengeType) {
          case 'streak': {
            // Check if all linked habits were completed today
            const allCompleted = linkedHabits.every(habit => {
              if (habit.habitType === 'normal') {
                return tasks.find(t => t.id === habit.id)?.completed;
              } else if (habit.habitType === 'side') {
                return (habit as SideHabit).completedDates.includes(today);
              } else if (habit.habitType === 'negative') {
                const negHabit = habit as NegativeHabit;
                return negHabit.avoidedDates.includes(today) || !negHabit.failedDates.includes(today);
              }
              return false;
            });
            
            if (allCompleted) {
              newProgress = Math.min(challenge.targetValue, newProgress + 1);
            } else {
              newProgress = 0; // Reset streak if not all completed
            }
            break;
          }
          
          case 'frequency': {
            // Count total completions
            let totalCompletions = 0;
            linkedHabits.forEach(habit => {
              if (habit.habitType === 'side') {
                totalCompletions += (habit as SideHabit).completedDates.length;
              } else if (habit.habitType === 'negative') {
                totalCompletions += (habit as NegativeHabit).avoidedDates.length;
              }
            });
            newProgress = Math.min(challenge.targetValue, totalCompletions);
            break;
          }
          
          case 'avoidance': {
            // Count days where negative habit was avoided
            const avoidedDays = linkedHabits.reduce((count, habit) => {
              if (habit.habitType === 'negative') {
                return count + (habit as NegativeHabit).avoidedDates.length;
              }
              return count;
            }, 0);
            newProgress = Math.min(challenge.targetValue, avoidedDays);
            break;
          }
          
          case 'completion': {
            // Calculate daily completion percentage and count qualifying days
            const daysSinceStart = Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24));
            let qualifyingDays = 0;
            
            for (let i = 0; i <= daysSinceStart; i++) {
              const checkDate = new Date(challenge.startDate);
              checkDate.setDate(checkDate.getDate() + i);
              const dateStr = checkDate.toDateString();
              
              const completedCount = linkedHabits.filter(habit => {
                if (habit.habitType === 'side') {
                  return (habit as SideHabit).completedDates.includes(dateStr);
                } else if (habit.habitType === 'negative') {
                  return (habit as NegativeHabit).avoidedDates.includes(dateStr);
                }
                return false;
              }).length;
              
              const completionRate = linkedHabits.length > 0 ? (completedCount / linkedHabits.length) * 100 : 0;
              
              if (completionRate >= challenge.targetValue) {
                qualifyingDays++;
              }
            }
            
            newProgress = qualifyingDays;
            break;
          }
          
          case 'combo': {
            // Count days where all linked habits were completed
            const daysSinceStart = Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24));
            let comboDays = 0;
            
            for (let i = 0; i <= daysSinceStart; i++) {
              const checkDate = new Date(challenge.startDate);
              checkDate.setDate(checkDate.getDate() + i);
              const dateStr = checkDate.toDateString();
              
              const allCompletedOnDay = linkedHabits.every(habit => {
                if (habit.habitType === 'side') {
                  return (habit as SideHabit).completedDates.includes(dateStr);
                } else if (habit.habitType === 'negative') {
                  return (habit as NegativeHabit).avoidedDates.includes(dateStr);
                }
                return false;
              });
              
              if (allCompletedOnDay) {
                comboDays++;
              }
            }
            
            newProgress = comboDays;
            break;
          }
        }
        
        // Check if challenge is completed
        const isCompleted = newProgress >= challenge.targetValue;
        
        if (isCompleted && !challenge.isCompleted) {
          // Award XP and badge
          awardXP('bonus', challenge.id, challenge.xpReward, `Completed challenge: ${challenge.title}`);
        }
        
        return {
          ...challenge,
          progress: newProgress,
          isCompleted,
          completedAt: isCompleted && !challenge.isCompleted ? new Date() : challenge.completedAt
        };
      }));
    };
    
    updateChallengeProgress();
  }, [tasks, sideHabits, negativeHabits, allHabits, awardXP]);

  const handleCreateChallenge = () => {
    if (!challengeForm.title.trim() || selectedHabits.length === 0) return;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + challengeForm.timeLimit);
    
    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      ...challengeForm,
      linkedHabits: selectedHabits,
      habitTypes: selectedHabitTypes,
      progress: 0,
      isCompleted: false,
      isActive: true,
      startDate,
      endDate,
      dailyProgress: {}
    };
    
    setChallenges(prev => [...prev, newChallenge]);
    
    // Reset form
    setChallengeForm({
      title: '',
      description: '',
      xpReward: 100,
      badgeReward: '',
      timeLimit: 7,
      targetValue: 7,
      challengeType: 'streak'
    });
    setSelectedHabits([]);
    setSelectedHabitTypes([]);
    setIsCreateModalOpen(false);
  };

  const retryChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? {
            ...challenge,
            progress: 0,
            isCompleted: false,
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + challenge.timeLimit * 24 * 60 * 60 * 1000),
            completedAt: undefined,
            dailyProgress: {}
          }
        : challenge
    ));
  };

  const deleteChallenge = (challengeId: string) => {
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
  };

  const toggleHabitSelection = (habitId: string, habitType: 'normal' | 'side' | 'negative') => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
    
    setSelectedHabitTypes(prev => 
      prev.includes(habitType)
        ? prev
        : [...prev, habitType]
    );
  };

  const getDaysRemaining = (challenge: Challenge) => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getProgressPercentage = (challenge: Challenge) => {
    return Math.min(100, (challenge.progress / challenge.targetValue) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Challenge System
          </h2>
          <p className="text-muted-foreground">
            Create automated challenges that track your habits and reward your progress
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Challenge Title</Label>
                  <Input
                    id="title"
                    value={challengeForm.title}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., 7-Day Meditation Streak"
                  />
                </div>
                <div>
                  <Label htmlFor="challengeType">Challenge Type</Label>
                  <Select
                    value={challengeForm.challengeType}
                    onValueChange={(value: Challenge['challengeType']) => 
                      setChallengeForm(prev => ({ ...prev, challengeType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHALLENGE_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your challenge..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timeLimit">Time Limit (days)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={challengeForm.timeLimit}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={challengeForm.targetValue}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    value={challengeForm.xpReward}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, xpReward: Number(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="badgeReward">Badge Reward (Optional)</Label>
                <Input
                  id="badgeReward"
                  value={challengeForm.badgeReward}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, badgeReward: e.target.value }))}
                  placeholder="e.g., Meditation Master"
                />
              </div>

              {/* Habit Selection */}
              <div className="space-y-4">
                <Label>Select Habits to Track</Label>
                
                {/* Normal Habits */}
                {normalHabits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Normal Habits</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {normalHabits.map(habit => (
                        <div key={habit.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`habit-${habit.id}`}
                            checked={selectedHabits.includes(habit.id)}
                            onCheckedChange={() => toggleHabitSelection(habit.id, 'normal')}
                          />
                          <Label htmlFor={`habit-${habit.id}`} className="text-sm">
                            {habit.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side Habits */}
                {sideHabits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Side Habits</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {sideHabits.map(habit => (
                        <div key={habit.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`side-habit-${habit.id}`}
                            checked={selectedHabits.includes(habit.id)}
                            onCheckedChange={() => toggleHabitSelection(habit.id, 'side')}
                          />
                          <Label htmlFor={`side-habit-${habit.id}`} className="text-sm">
                            {habit.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Negative Habits */}
                {negativeHabits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Negative Habits</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {negativeHabits.map(habit => (
                        <div key={habit.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`neg-habit-${habit.id}`}
                            checked={selectedHabits.includes(habit.id)}
                            onCheckedChange={() => toggleHabitSelection(habit.id, 'negative')}
                          />
                          <Label htmlFor={`neg-habit-${habit.id}`} className="text-sm">
                            {habit.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedHabits.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Please select at least one habit to track
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Challenge Preview</span>
                </div>
                <p className="text-sm text-blue-800">
                  {CHALLENGE_TYPES.find(t => t.id === challengeForm.challengeType)?.description}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateChallenge} 
                  className="flex-1"
                  disabled={!challengeForm.title.trim() || selectedHabits.length === 0}
                >
                  Create Challenge
                </Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Challenges */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Challenges</h3>
        {challenges.filter(c => c.isActive && !c.isCompleted).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No active challenges
              </h3>
              <p className="text-sm text-muted-foreground">
                Create your first challenge to start tracking your progress!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges
              .filter(c => c.isActive && !c.isCompleted)
              .map(challenge => {
                const daysRemaining = getDaysRemaining(challenge);
                const progressPercentage = getProgressPercentage(challenge);
                
                return (
                  <Card key={challenge.id} className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {challenge.description}
                          </p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{challenge.progress}/{challenge.targetValue}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{daysRemaining} days left</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          <span>{challenge.xpReward} XP</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryChallenge(challenge.id)}
                          className="flex-1 gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Retry
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteChallenge(challenge.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Completed Challenges */}
      {challenges.filter(c => c.isCompleted).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Completed Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges
              .filter(c => c.isCompleted)
              .map(challenge => (
                <Card key={challenge.id} className="border-green-200 bg-green-50 dark:bg-green-950/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {challenge.description}
                        </p>
                      </div>
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Progress value={100} className="h-2 bg-green-200" />
                      <div className="text-sm text-center text-green-700">
                        {challenge.progress}/{challenge.targetValue} - Complete!
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <Zap className="h-4 w-4" />
                        <span>{challenge.xpReward} XP Earned</span>
                      </div>
                      {challenge.badgeReward && (
                        <Badge variant="outline">{challenge.badgeReward}</Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => retryChallenge(challenge.id)}
                      className="w-full gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Retry Challenge
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
