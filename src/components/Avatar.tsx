
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserProgress, getXPForCurrentLevel, getXPForNextLevel } from '../types/task';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AvatarProps {
  progress: UserProgress;
  size?: 'small' | 'large';
  showDetails?: boolean;
}

interface AvatarData {
  name: string;
  mood: 'happy' | 'neutral' | 'sad' | 'tired' | 'excited';
  energy: number;
  style: 'default' | 'cool' | 'cute' | 'professional';
}

export function Avatar({ progress, size = 'small', showDetails = false }: AvatarProps) {
  const [avatarData, setAvatarData] = useLocalStorage<AvatarData>('avatarData', {
    name: 'Buddy',
    mood: 'happy',
    energy: 100,
    style: 'default',
  });

  // Determine avatar appearance based on level and style
  const getAvatarEmoji = () => {
    const { style } = avatarData;
    
    if (progress.level >= 15 && style === 'cool') return '😎'; // Cool sunglasses
    if (progress.level >= 15 && style === 'professional') return '👔'; // Business
    if (progress.level >= 10 && style === 'cute') return '🥰'; // Cute
    if (progress.level >= 10) return '🦸'; // Superhero
    if (progress.level >= 7) return '🧙'; // Wizard
    if (progress.level >= 5) return '🥷'; // Ninja
    if (progress.level >= 3) return '🤖'; // Robot
    if (style === 'cute') return '🐣'; // Cute chick
    return '🌱'; // Seedling
  };

  // Determine mood based on streak and recent activity
  const getCurrentMood = (): 'happy' | 'neutral' | 'sad' | 'tired' | 'excited' => {
    if (progress.currentStreak >= 10) return 'excited';
    if (progress.currentStreak >= 7) return 'happy';
    if (progress.currentStreak >= 3) return 'neutral';
    if (progress.currentStreak === 0) return 'sad';
    if (avatarData.energy < 30) return 'tired';
    return 'neutral';
  };

  // Get mood emoji with more variety
  const getMoodEmoji = () => {
    const mood = getCurrentMood();
    switch (mood) {
      case 'excited': return '🤩';
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  // Get mood description
  const getMoodDescription = () => {
    const mood = getCurrentMood();
    switch (mood) {
      case 'excited': return 'On fire! Amazing streak!';
      case 'happy': return 'Feeling great!';
      case 'sad': return 'Needs motivation';
      case 'tired': return 'Running low on energy';
      default: return 'Doing okay';
    }
  };

  const currentLevelXP = getXPForCurrentLevel(progress.totalXP);
  const nextLevelXP = getXPForNextLevel(progress.totalXP);
  const levelProgress = nextLevelXP > 0 ? (currentLevelXP / nextLevelXP) * 100 : 100;

  const avatarSize = size === 'large' ? 'text-8xl' : 'text-4xl';

  if (size === 'small') {
    return (
      <div className="flex items-center gap-3 p-2">
        <div className="relative">
          <div className={`${avatarSize} select-none transition-transform hover:scale-110`}>
            {getAvatarEmoji()}
          </div>
          <div className="absolute -bottom-1 -right-1 text-lg animate-pulse">
            {getMoodEmoji()}
          </div>
        </div>
        {showDetails && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{avatarData.name}</div>
            <div className="text-xs text-muted-foreground">Level {progress.level} • {getMoodDescription()}</div>
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
          <div className={`${avatarSize} select-none transition-transform hover:scale-110 cursor-pointer`}>
            {getAvatarEmoji()}
          </div>
          <div className="absolute -bottom-2 -right-2 text-3xl animate-bounce">
            {getMoodEmoji()}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">{avatarData.name}</h2>
        <div className="space-y-1 mb-4">
          <p className="text-muted-foreground">Level {progress.level} Productivity Companion</p>
          <p className="text-sm text-primary font-medium">{getMoodDescription()}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>XP Progress</span>
              <span>{currentLevelXP}/{nextLevelXP}</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Energy</span>
              <span>{avatarData.energy}%</span>
            </div>
            <Progress 
              value={avatarData.energy} 
              className="h-2"
              // TODO: Add energy color variation based on level
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <div className="text-lg font-bold text-primary">{progress.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
              <div className="text-xs">
                {progress.currentStreak >= 7 ? '🔥' : progress.currentStreak >= 3 ? '⭐' : '💪'}
              </div>
            </div>
            <div className="p-3 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-colors">
              <div className="text-lg font-bold text-secondary">{progress.totalXP}</div>
              <div className="text-xs text-muted-foreground">Total XP</div>
              <div className="text-xs">🏆</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
