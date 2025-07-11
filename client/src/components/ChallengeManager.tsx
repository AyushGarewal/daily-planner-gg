
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Plus, Target, Calendar, Award } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  targetValue: number;
  currentValue: number;
  timeLimit: number; // days
  xpReward: number;
  badgeReward: string;
  createdAt: Date;
  completedAt?: Date;
  isActive: boolean;
}

export function ChallengeManager() {
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>('custom-challenges', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    targetValue: 5,
    timeLimit: 7,
    xpReward: 100,
    badgeReward: '🏆'
  });

  const createChallenge = () => {
    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      ...formData,
      currentValue: 0,
      createdAt: new Date(),
      isActive: true
    };
    
    setChallenges(prev => [...prev, newChallenge]);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      goal: '',
      targetValue: 5,
      timeLimit: 7,
      xpReward: 100,
      badgeReward: '🏆'
    });
  };

  const getDaysRemaining = (challenge: Challenge) => {
    const daysPassed = Math.floor((Date.now() - new Date(challenge.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, challenge.timeLimit - daysPassed);
  };

  const getProgressPercentage = (challenge: Challenge) => {
    return Math.min(100, (challenge.currentValue / challenge.targetValue) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Custom Challenges
          </h2>
          <p className="text-muted-foreground">Create and track personal challenges</p>
        </div>
        
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Challenge
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Challenge Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Complete 80% of daily tasks"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your challenge..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Value</label>
                <Input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time Limit (days)</label>
                <Input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="30"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">XP Reward</label>
                <Input
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Badge Reward</label>
                <Input
                  value={formData.badgeReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, badgeReward: e.target.value }))}
                  placeholder="🏆"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createChallenge} className="flex-1">
                Create Challenge
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {challenges.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No challenges yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your first challenge to start tracking your goals!
            </p>
          </div>
        ) : (
          challenges.map((challenge) => {
            const daysRemaining = getDaysRemaining(challenge);
            const progress = getProgressPercentage(challenge);
            const isCompleted = challenge.currentValue >= challenge.targetValue;
            const isExpired = daysRemaining === 0 && !isCompleted;
            
            return (
              <Card key={challenge.id} className={`${isCompleted ? 'bg-green-50 border-green-200' : isExpired ? 'bg-red-50 border-red-200' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {challenge.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {isCompleted && <Badge className="bg-green-500">Completed</Badge>}
                      {isExpired && <Badge variant="destructive">Expired</Badge>}
                      {!isCompleted && !isExpired && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {daysRemaining} days left
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.currentValue}/{challenge.targetValue}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span>{challenge.targetValue} target</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span>{challenge.xpReward} XP</span>
                      </div>
                    </div>
                    
                    <div className="text-xl">{challenge.badgeReward}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
