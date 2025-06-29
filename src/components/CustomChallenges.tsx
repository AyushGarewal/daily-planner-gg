
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Trophy, Target, Plus, Clock, CheckCircle, X } from 'lucide-react';
import { Challenge } from '../types/achievements';
import { format, addDays, differenceInDays } from 'date-fns';

export function CustomChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    name: '',
    description: '',
    goal: '',
    duration: 7,
    xpReward: 100,
    badgeIcon: '🏆',
    conditionType: 'completion_percentage' as Challenge['conditions'][0]['type']
  });

  const handleCreateChallenge = () => {
    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      name: challengeForm.name,
      description: challengeForm.description,
      goal: challengeForm.goal,
      duration: challengeForm.duration,
      startDate: new Date(),
      endDate: addDays(new Date(), challengeForm.duration),
      progress: 0,
      completed: false,
      xpReward: challengeForm.xpReward,
      badgeIcon: challengeForm.badgeIcon,
      conditions: [{
        type: challengeForm.conditionType,
        target: challengeForm.conditionType === 'completion_percentage' ? 80 : 
               challengeForm.conditionType === 'task_count' ? 10 :
               challengeForm.conditionType === 'streak_days' ? 5 : 3
      }]
    };

    setChallenges(prev => [...prev, newChallenge]);
    setIsCreateModalOpen(false);
    setChallengeForm({
      name: '',
      description: '',
      goal: '',
      duration: 7,
      xpReward: 100,
      badgeIcon: '🏆',
      conditionType: 'completion_percentage'
    });
  };

  const deleteChallenge = (id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
  };

  const getDaysRemaining = (challenge: Challenge) => {
    const today = new Date();
    const endDate = new Date(challenge.endDate);
    return Math.max(0, differenceInDays(endDate, today));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-500" />
            Challenges
          </h2>
          <p className="text-muted-foreground">
            Create and track custom challenges to boost your productivity
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Challenge Name</Label>
                <Input
                  id="name"
                  value={challengeForm.name}
                  onChange={(e) => setChallengeForm({ ...challengeForm, name: e.target.value })}
                  placeholder="e.g., 7-Day Fitness Challenge"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                  placeholder="Describe your challenge..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="goal">Goal</Label>
                <Input
                  id="goal"
                  value={challengeForm.goal}
                  onChange={(e) => setChallengeForm({ ...challengeForm, goal: e.target.value })}
                  placeholder="e.g., Complete 30 minutes of exercise daily"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={challengeForm.duration}
                    onChange={(e) => setChallengeForm({ ...challengeForm, duration: Number(e.target.value) })}
                    min="1"
                    max="365"
                  />
                </div>
                
                <div>
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    value={challengeForm.xpReward}
                    onChange={(e) => setChallengeForm({ ...challengeForm, xpReward: Number(e.target.value) })}
                    min="10"
                    step="10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="conditionType">Challenge Type</Label>
                <Select
                  value={challengeForm.conditionType}
                  onValueChange={(value: Challenge['conditions'][0]['type']) => 
                    setChallengeForm({ ...challengeForm, conditionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completion_percentage">Daily Completion %</SelectItem>
                    <SelectItem value="task_count">Task Count</SelectItem>
                    <SelectItem value="streak_days">Streak Days</SelectItem>
                    <SelectItem value="category_focus">Category Focus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="badgeIcon">Badge Icon</Label>
                <Input
                  id="badgeIcon"
                  value={challengeForm.badgeIcon}
                  onChange={(e) => setChallengeForm({ ...challengeForm, badgeIcon: e.target.value })}
                  placeholder="🏆"
                  maxLength={2}
                />
              </div>
              
              <Button onClick={handleCreateChallenge} className="w-full">
                Create Challenge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No challenges created yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first challenge to start building productive habits!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => {
            const daysRemaining = getDaysRemaining(challenge);
            const isActive = daysRemaining > 0 && !challenge.completed;
            const isCompleted = challenge.completed;
            const isExpired = daysRemaining === 0 && !challenge.completed;
            
            return (
              <Card key={challenge.id} className={`transition-all duration-200 ${
                isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-950/30' :
                isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' :
                'border-red-500 bg-red-50 dark:bg-red-950/30'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{challenge.badgeIcon}</span>
                      <div>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={isCompleted ? "default" : isActive ? "secondary" : "destructive"} className="text-xs">
                            {isCompleted ? "Completed" : isActive ? "Active" : "Expired"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {challenge.xpReward} XP
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteChallenge(challenge.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(challenge.progress)}%</span>
                    </div>
                    <Progress 
                      value={challenge.progress} 
                      className={`h-2 ${getProgressColor(challenge.progress)}`}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {isCompleted ? "Completed" : 
                         isActive ? `${daysRemaining} days left` : 
                         "Expired"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{challenge.goal}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
