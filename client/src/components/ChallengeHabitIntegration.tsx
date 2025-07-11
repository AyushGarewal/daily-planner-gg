
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trophy, Target, Plus, CheckCircle2, Circle, Flame, Star } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task';

interface ChallengeHabitIntegrationProps {
  challengeId?: string;
  challengeName?: string;
  onHabitProgress?: (habitId: string, progress: number) => void;
}

interface ChallengeHabitLink {
  id: string;
  challengeId: string;
  habitId: string;
  targetCount: number;
  currentCount: number;
  rewardXP: number;
}

export function ChallengeHabitIntegration({ 
  challengeId, 
  challengeName,
  onHabitProgress 
}: ChallengeHabitIntegrationProps) {
  const { tasks, getUserHabits } = useTasks();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [targetCount, setTargetCount] = useState(10);
  const [rewardXP, setRewardXP] = useState(100);

  // Get challenge habit links from localStorage
  const getChallengeHabits = (): ChallengeHabitLink[] => {
    try {
      const links = JSON.parse(localStorage.getItem('challengeHabitLinks') || '[]');
      return challengeId ? links.filter((link: ChallengeHabitLink) => link.challengeId === challengeId) : links;
    } catch {
      return [];
    }
  };

  const saveChallengeHabits = (links: ChallengeHabitLink[]) => {
    try {
      const allLinks = JSON.parse(localStorage.getItem('challengeHabitLinks') || '[]');
      const otherLinks = allLinks.filter((link: ChallengeHabitLink) => link.challengeId !== challengeId);
      localStorage.setItem('challengeHabitLinks', JSON.stringify([...otherLinks, ...links]));
    } catch (error) {
      console.error('Error saving challenge habits:', error);
    }
  };

  const [challengeHabits, setChallengeHabits] = useState<ChallengeHabitLink[]>(getChallengeHabits);

  // Get unique habits (deduplicated)
  const availableHabits = getUserHabits().filter(habit => 
    !challengeHabits.some(ch => ch.habitId === habit.id)
  );

  const handleLinkHabit = () => {
    if (!selectedHabitId || !challengeId) return;

    const newLink: ChallengeHabitLink = {
      id: `challenge_habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      challengeId,
      habitId: selectedHabitId,
      targetCount,
      currentCount: 0,
      rewardXP
    };

    const updatedLinks = [...challengeHabits, newLink];
    setChallengeHabits(updatedLinks);
    saveChallengeHabits(updatedLinks);
    
    setIsLinkDialogOpen(false);
    setSelectedHabitId('');
    setTargetCount(10);
    setRewardXP(100);
  };

  const updateHabitProgress = (linkId: string, increment: number = 1) => {
    const updatedLinks = challengeHabits.map(link => {
      if (link.id === linkId) {
        const newCount = Math.min(link.currentCount + increment, link.targetCount);
        onHabitProgress?.(link.habitId, newCount);
        return { ...link, currentCount: newCount };
      }
      return link;
    });
    
    setChallengeHabits(updatedLinks);
    saveChallengeHabits(updatedLinks);
  };

  const removeHabitLink = (linkId: string) => {
    const updatedLinks = challengeHabits.filter(link => link.id !== linkId);
    setChallengeHabits(updatedLinks);
    saveChallengeHabits(updatedLinks);
  };

  const calculateOverallProgress = () => {
    if (challengeHabits.length === 0) return 0;
    
    const totalProgress = challengeHabits.reduce((sum, link) => {
      return sum + (link.currentCount / link.targetCount);
    }, 0);
    
    return Math.round((totalProgress / challengeHabits.length) * 100);
  };

  const getHabitDetails = (habitId: string) => {
    return tasks.find(task => task.id === habitId && task.type === 'habit');
  };

  const overallProgress = calculateOverallProgress();
  const totalPossibleXP = challengeHabits.reduce((sum, link) => sum + link.rewardXP, 0);
  const earnedXP = challengeHabits.reduce((sum, link) => {
    const progressPercent = link.currentCount / link.targetCount;
    return sum + Math.floor(link.rewardXP * progressPercent);
  }, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {challengeName ? `${challengeName} - Habits` : 'Challenge Habits'}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {challengeHabits.length} habits
            </Badge>
            
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Link Habit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Link Habit to Challenge</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="habit-select">Select Habit</Label>
                    <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a habit" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableHabits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.id}>
                            <div className="flex items-center gap-2">
                              <span>{habit.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {habit.recurrence}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target-count">Target Count</Label>
                      <input
                        id="target-count"
                        type="number"
                        min="1"
                        max="1000"
                        value={targetCount}
                        onChange={(e) => setTargetCount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reward-xp">Reward XP</Label>
                      <input
                        id="reward-xp"
                        type="number"
                        min="10"
                        max="1000"
                        value={rewardXP}
                        onChange={(e) => setRewardXP(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleLinkHabit} className="flex-1" disabled={!selectedHabitId}>
                      Link Habit
                    </Button>
                    <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overall Progress */}
        {challengeHabits.length > 0 && (
          <div className="space-y-3 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
                <div className="flex items-center gap-2">
                  <Progress value={overallProgress} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{overallProgress}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">XP Progress</div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{earnedXP} / {totalPossibleXP} XP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {challengeHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">No habits linked to this challenge</p>
            <p className="text-xs">Link existing habits to create challenge objectives</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challengeHabits.map((link) => {
              const habit = getHabitDetails(link.habitId);
              const progressPercent = Math.round((link.currentCount / link.targetCount) * 100);
              const isCompleted = link.currentCount >= link.targetCount;
              
              if (!habit) return null;
              
              return (
                <div key={link.id} className={`border rounded-lg p-4 transition-colors ${
                  isCompleted ? 'border-green-200 bg-green-50' : ''
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h4 className="font-medium">{habit.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {habit.recurrence}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {habit.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHabitLink(link.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {link.currentCount} / {link.targetCount} completions
                      </span>
                    </div>
                    
                    <Progress value={progressPercent} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateHabitProgress(link.id, 1)}
                          disabled={isCompleted}
                        >
                          +1 Progress
                        </Button>
                        
                        {link.currentCount > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateHabitProgress(link.id, -1)}
                          >
                            -1
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-yellow-50">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {Math.floor(link.rewardXP * (link.currentCount / link.targetCount))} / {link.rewardXP} XP
                        </Badge>
                        
                        {isCompleted && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Completed!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
