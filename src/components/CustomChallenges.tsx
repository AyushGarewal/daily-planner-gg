import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Trophy, Calendar, Zap, CheckCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Challenge } from '../types/achievements';
import { CATEGORIES } from '../types/task';
import { useTasks } from '../hooks/useTasks';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

const CHALLENGE_ICONS = ['🎯', '🏆', '🚀', '⚡', '💪', '🔥', '🌟', '💎', '👑', '🎪'];

const CHALLENGE_TYPES = [
  { value: 'completion_percentage', label: 'Daily Task Completion %' },
  { value: 'task_count', label: 'Complete X Tasks' },
  { value: 'streak_days', label: 'Maintain Streak' },
  { value: 'category_focus', label: 'Category-Specific Tasks' },
];

export function CustomChallenges() {
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>('customChallenges', []);
  const [isCreating, setIsCreating] = useState(false);
  const { tasks, getTodayCompletionPercentage } = useTasks();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    duration: 7,
    xpReward: 100,
    badgeIcon: '🎯',
    conditions: [{
      type: 'completion_percentage' as const,
      target: 80,
      category: undefined
    }]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      goal: '',
      duration: 7,
      xpReward: 100,
      badgeIcon: '🎯',
      conditions: [{
        type: 'completion_percentage',
        target: 80,
        category: undefined
      }]
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.goal.trim()) return;

    const startDate = new Date();
    const endDate = addDays(startDate, formData.duration);

    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      goal: formData.goal,
      duration: formData.duration,
      startDate,
      endDate,
      progress: 0,
      completed: false,
      xpReward: formData.xpReward,
      badgeIcon: formData.badgeIcon,
      conditions: formData.conditions
    };

    setChallenges(prev => [...prev, newChallenge]);
    setIsCreating(false);
    resetForm();
  };

  const updateChallengeProgress = (challenge: Challenge): Challenge => {
    if (challenge.completed || isAfter(new Date(), challenge.endDate)) {
      return challenge;
    }

    let dailyProgress = 0;
    const today = new Date();
    
    challenge.conditions.forEach(condition => {
      switch (condition.type) {
        case 'completion_percentage':
          const completionPercentage = getTodayCompletionPercentage();
          if (completionPercentage >= condition.target) {
            dailyProgress += 1;
          }
          break;
        
        case 'task_count':
          const todayTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate).toDateString();
            const todayDate = today.toDateString();
            return taskDate === todayDate && task.completed;
          });
          
          const relevantTasks = condition.category 
            ? todayTasks.filter(task => task.category === condition.category)
            : todayTasks;
            
          if (relevantTasks.length >= condition.target) {
            dailyProgress += 1;
          }
          break;
        
        case 'category_focus':
          const categoryTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate).toDateString();
            const todayDate = today.toDateString();
            return taskDate === todayDate && task.completed && task.category === condition.category;
          });
          
          if (categoryTasks.length >= condition.target) {
            dailyProgress += 1;
          }
          break;
      }
    });

    // Calculate total progress based on days completed successfully
    const daysElapsed = Math.max(1, differenceInDays(today, challenge.startDate) + 1);
    const totalDays = challenge.duration;
    const progressPercentage = Math.min(100, (dailyProgress / challenge.conditions.length) * 100);

    const updatedChallenge = {
      ...challenge,
      progress: Math.min(100, (daysElapsed / totalDays) * progressPercentage)
    };

    // Check if challenge is completed
    if (daysElapsed >= totalDays && progressPercentage >= 100) {
      updatedChallenge.completed = true;
    }

    return updatedChallenge;
  };

  // Update challenge progress periodically
  useEffect(() => {
    const updateAllChallenges = () => {
      setChallenges(prev => prev.map(updateChallengeProgress));
    };

    updateAllChallenges();
    const interval = setInterval(updateAllChallenges, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tasks]);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConditionDescription = (condition: Challenge['conditions'][0]) => {
    switch (condition.type) {
      case 'completion_percentage':
        return `Complete ${condition.target}% of daily tasks`;
      case 'task_count':
        return `Complete ${condition.target} ${condition.category ? `${condition.category} ` : ''}tasks daily`;
      case 'streak_days':
        return `Maintain a ${condition.target} day streak`;
      case 'category_focus':
        return `Complete ${condition.target} ${condition.category} tasks daily`;
      default:
        return 'Custom condition';
    }
  };

  const activeChallenges = challenges.filter(c => !c.completed && !isAfter(new Date(), c.endDate));
  const completedChallenges = challenges.filter(c => c.completed);
  const expiredChallenges = challenges.filter(c => !c.completed && isAfter(new Date(), c.endDate));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-500" />
            Custom Challenges
          </h2>
          <p className="text-muted-foreground">
            {activeChallenges.length} active • {completedChallenges.length} completed
          </p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Challenge</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Challenge Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter challenge name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Duration (days)</label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Goal Description</label>
                <Input
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="e.g., Complete 80% of tasks daily for 7 days"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Challenge Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the challenge and its benefits"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">XP Reward</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 100 })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Badge Icon</label>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {CHALLENGE_ICONS.slice(0, 5).map((icon) => (
                      <Button
                        key={icon}
                        variant={formData.badgeIcon === icon ? "default" : "outline"}
                        className="text-lg h-8 w-8 p-0"
                        onClick={() => setFormData({ ...formData, badgeIcon: icon })}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Challenge Conditions</label>
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="border rounded-lg p-4 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Type</label>
                        <Select
                          value={condition.type}
                          onValueChange={(value) => {
                            const newConditions = [...formData.conditions];
                            newConditions[index] = { ...condition, type: value as any };
                            setFormData({ ...formData, conditions: newConditions });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CHALLENGE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium">Target</label>
                        <Input
                          type="number"
                          min="1"
                          value={condition.target}
                          onChange={(e) => {
                            const newConditions = [...formData.conditions];
                            newConditions[index] = { ...condition, target: parseInt(e.target.value) || 1 };
                            setFormData({ ...formData, conditions: newConditions });
                          }}
                        />
                      </div>

                      {(condition.type === 'category_focus' || condition.type === 'task_count') && (
                        <div className="sm:col-span-2">
                          <label className="text-xs font-medium">Category (optional)</label>
                          <Select
                            value={condition.category || ''}
                            onValueChange={(value) => {
                              const newConditions = [...formData.conditions];
                              newConditions[index] = { ...condition, category: value || undefined };
                              setFormData({ ...formData, conditions: newConditions });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All categories</SelectItem>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                      Preview: {getConditionDescription(condition)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleCreate} className="flex-1" disabled={!formData.name.trim() || !formData.goal.trim()}>
                  Create Challenge
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Active Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{challenge.badgeIcon}</span>
                      <div>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{challenge.goal}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {differenceInDays(challenge.endDate, new Date())} days left
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(challenge.progress)}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      {challenge.conditions.map((condition, index) => (
                        <div key={index} className="text-xs bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                          {getConditionDescription(condition)}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {format(challenge.startDate, 'MMM dd')} - {format(challenge.endDate, 'MMM dd')}
                      </span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        +{challenge.xpReward} XP
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Completed Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedChallenges.map((challenge) => (
              <Card key={challenge.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{challenge.badgeIcon}</span>
                    <div>
                      <CardTitle className="text-base">{challenge.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{challenge.goal}</p>
                  <Badge variant="outline" className="text-xs">
                    +{challenge.xpReward} XP Earned
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {challenges.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No challenges created yet</h3>
          <p className="text-sm mb-4">Create your first custom challenge to boost your productivity!</p>
          <p className="text-xs">Examples: "Complete 80% of tasks for 7 days" or "Focus on Health category for 5 days"</p>
        </div>
      )}
    </div>
  );
}
