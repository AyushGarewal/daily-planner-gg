
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserProgress, XP_PER_LEVEL } from '../types/task';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AvatarProps {
  progress: UserProgress;
  size?: 'small' | 'large';
  showDetails?: boolean;
}

interface AvatarData {
  name: string;
  mood: 'happy' | 'neutral' | 'sad' | 'tired';
  energy: number;
}

export function Avatar({ progress, size = 'small', showDetails = false }: AvatarProps) {
  const [avatarData, setAvatarData] = useLocalStorage<AvatarData>('avatarData', {
    name: 'Buddy',
    mood: 'happy',
    energy: 100,
  });

  // Determine avatar appearance based on level
  const getAvatarEmoji = () => {
    if (progress.level >= 10) return '🦸'; // Superhero
    if (progress.level >= 7) return '🧙'; // Wizard
    if (progress.level >= 5) return '🥷'; // Ninja
    if (progress.level >= 3) return '🤖'; // Robot
    return '🐣'; // Egg/Chick
  };

  // Determine mood based on streak and recent activity
  const getCurrentMood = () => {
    if (progress.currentStreak >= 7) return 'happy';
    if (progress.currentStreak >= 3) return 'neutral';
    if (progress.currentStreak === 0) return 'sad';
    return 'neutral';
  };

  // Get mood emoji
  const getMoodEmoji = () => {
    const mood = getCurrentMood();
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  const currentLevelXP = progress.totalXP % XP_PER_LEVEL;
  const levelProgress = (currentLevelXP / XP_PER_LEVEL) * 100;

  const avatarSize = size === 'large' ? 'text-8xl' : 'text-4xl';

  if (size === 'small') {
    return (
      <div className="flex items-center gap-3 p-2">
        <div className="relative">
          <div className={`${avatarSize} select-none`}>
            {getAvatarEmoji()}
          </div>
          <div className="absolute -bottom-1 -right-1 text-lg">
            {getMoodEmoji()}
          </div>
        </div>
        {showDetails && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{avatarData.name}</div>
            <div className="text-xs text-muted-foreground">Level {progress.level}</div>
            <Progress value={levelProgress} className="h-1 mt-1" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="relative inline-block mb-4">
          <div className={`${avatarSize} select-none`}>
            {getAvatarEmoji()}
          </div>
          <div className="absolute -bottom-2 -right-2 text-3xl">
            {getMoodEmoji()}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">{avatarData.name}</h2>
        <p className="text-muted-foreground mb-4">Level {progress.level} Productivity Companion</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>XP Progress</span>
              <span>{currentLevelXP}/{XP_PER_LEVEL}</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Energy</span>
              <span>{avatarData.energy}%</span>
            </div>
            <Progress value={avatarData.energy} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="text-lg font-bold text-primary">{progress.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="p-3 bg-secondary/5 rounded-lg">
              <div className="text-lg font-bold text-secondary">{progress.totalXP}</div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
