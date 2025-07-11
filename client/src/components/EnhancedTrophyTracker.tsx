
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Target, Award, Lock } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAchievements } from '../hooks/useAchievements';

interface TrophyDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: {
    type: 'xp' | 'streak' | 'tasks' | 'habits' | 'level';
    target: number;
  };
  xpReward: number;
}

interface UnlockedTrophy {
  id: string;
  unlockedAt: Date;
  xpAwarded: number;
}

const TROPHY_DEFINITIONS: TrophyDefinition[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    condition: { type: 'tasks', target: 1 },
    xpReward: 50
  },
  {
    id: 'xp-collector',
    title: 'XP Collector',
    description: 'Earn 1000 XP',
    icon: '⭐',
    condition: { type: 'xp', target: 1000 },
    xpReward: 100
  },
  {
    id: 'streak-warrior',
    title: 'Streak Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    condition: { type: 'streak', target: 7 },
    xpReward: 150
  },
  {
    id: 'habit-builder',
    title: 'Habit Builder',
    description: 'Complete 50 habits',
    icon: '🏗️',
    condition: { type: 'habits', target: 50 },
    xpReward: 200
  },
  {
    id: 'level-up-master',
    title: 'Level Up Master',
    description: 'Reach level 10',
    icon: '🎖️',
    condition: { type: 'level', target: 10 },
    xpReward: 250
  },
  {
    id: 'task-master',
    title: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '✅',
    condition: { type: 'tasks', target: 100 },
    xpReward: 300
  },
  {
    id: 'xp-legend',
    title: 'XP Legend',
    description: 'Earn 5000 XP',
    icon: '🌟',
    condition: { type: 'xp', target: 5000 },
    xpReward: 500
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    condition: { type: 'streak', target: 30 },
    xpReward: 750
  }
];

export function EnhancedTrophyTracker() {
  const { progress, addBonusXP } = useTasks();
  const [unlockedTrophies, setUnlockedTrophies] = useLocalStorage<UnlockedTrophy[]>('unlocked-trophies', []);
  const [showNewTrophy, setShowNewTrophy] = useState<TrophyDefinition | null>(null);

  // Check for newly unlocked trophies
  useEffect(() => {
    const unlockedIds = new Set(unlockedTrophies.map(t => t.id));
    
    TROPHY_DEFINITIONS.forEach(trophy => {
      if (!unlockedIds.has(trophy.id) && checkTrophyCondition(trophy, progress)) {
        console.log(`Trophy unlocked: ${trophy.title}`);
        
        // Add to unlocked trophies
        const newUnlockedTrophy: UnlockedTrophy = {
          id: trophy.id,
          unlockedAt: new Date(),
          xpAwarded: trophy.xpReward
        };
        
        setUnlockedTrophies(prev => [...prev, newUnlockedTrophy]);
        
        // Award XP
        addBonusXP(trophy.xpReward);
        
        // Show trophy notification
        setShowNewTrophy(trophy);
        
        // Hide notification after 5 seconds
        setTimeout(() => setShowNewTrophy(null), 5000);
      }
    });
  }, [progress, unlockedTrophies, addBonusXP, setUnlockedTrophies]);

  const checkTrophyCondition = (trophy: TrophyDefinition, userProgress: typeof progress): boolean => {
    switch (trophy.condition.type) {
      case 'xp':
        return userProgress.totalXP >= trophy.condition.target;
      case 'streak':
        return userProgress.currentStreak >= trophy.condition.target;
      case 'tasks':
        return userProgress.tasksCompleted >= trophy.condition.target;
      case 'habits':
        return userProgress.habitsCompleted >= trophy.condition.target;
      case 'level':
        return userProgress.level >= trophy.condition.target;
      default:
        return false;
    }
  };

  const getTrophyProgress = (trophy: TrophyDefinition): number => {
    let current = 0;
    
    switch (trophy.condition.type) {
      case 'xp':
        current = progress.totalXP;
        break;
      case 'streak':
        current = progress.currentStreak;
        break;
      case 'tasks':
        current = progress.tasksCompleted;
        break;
      case 'habits':
        current = progress.habitsCompleted;
        break;
      case 'level':
        current = progress.level;
        break;
    }
    
    return Math.min((current / trophy.condition.target) * 100, 100);
  };

  const isUnlocked = (trophyId: string): boolean => {
    return unlockedTrophies.some(t => t.id === trophyId);
  };

  const getProgressText = (trophy: TrophyDefinition): string => {
    let current = 0;
    
    switch (trophy.condition.type) {
      case 'xp':
        current = progress.totalXP;
        break;
      case 'streak':
        current = progress.currentStreak;
        break;
      case 'tasks':
        current = progress.tasksCompleted;
        break;
      case 'habits':
        current = progress.habitsCompleted;
        break;
      case 'level':
        current = progress.level;
        break;
    }
    
    return `${Math.min(current, trophy.condition.target)}/${trophy.condition.target}`;
  };

  const unlockedCount = unlockedTrophies.length;
  const totalCount = TROPHY_DEFINITIONS.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Trophy Room
            </CardTitle>
            <Badge variant="secondary">
              {unlockedCount}/{totalCount} Unlocked
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Collection Progress</span>
              <span className="font-medium">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TROPHY_DEFINITIONS.map((trophy) => {
              const unlocked = isUnlocked(trophy.id);
              const progressPercent = getTrophyProgress(trophy);
              const progressText = getProgressText(trophy);
              
              return (
                <Card 
                  key={trophy.id} 
                  className={`relative overflow-hidden ${
                    unlocked 
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                      : 'bg-muted/20'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                          {trophy.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{trophy.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {unlocked ? (
                              <Badge variant="default" className="text-xs bg-yellow-500">
                                Unlocked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Locked
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              +{trophy.xpReward} XP
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {unlocked ? (
                        <Award className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {trophy.description}
                    </p>
                    
                    {!unlocked && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{progressText}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}
                    
                    {unlocked && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <Star className="h-4 w-4" />
                        <span>Trophy Unlocked!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* New Trophy Notification */}
      {showNewTrophy && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{showNewTrophy.icon}</div>
                <div>
                  <h3 className="font-bold">Trophy Unlocked!</h3>
                  <p className="text-sm opacity-90">{showNewTrophy.title}</p>
                  <p className="text-xs opacity-80">+{showNewTrophy.xpReward} XP</p>
                </div>
                <Trophy className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
