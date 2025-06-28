
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Shield, Zap, Trophy, Target } from 'lucide-react';
import { UserStats } from '../types/achievements';
import { UserProgress } from '../types/task';

interface StatusBarProps {
  userStats: UserStats;
  progress: UserProgress;
  canSpin: () => boolean;
  todayCompletionPercentage: number;
  onSpinClick: () => void;
}

export function StatusBar({ 
  userStats, 
  progress, 
  canSpin, 
  todayCompletionPercentage, 
  onSpinClick 
}: StatusBarProps) {
  const unlockedTrophies = userStats.achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left side - Key stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span className="hidden sm:inline">Streak:</span>
            <span className="font-bold">{progress.currentStreak}</span>
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-yellow-600" />
            <span className="hidden sm:inline">Trophies:</span>
            <span className="font-bold">{unlockedTrophies}</span>
          </Badge>

          {userStats.streakShields > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="h-3 w-3" />
              <span>{userStats.streakShields}</span>
            </Badge>
          )}

          {userStats.powerUps.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
              <Zap className="h-3 w-3" />
              <span>{userStats.powerUps.length}</span>
            </Badge>
          )}
        </div>

        {/* Right side - Daily spin button */}
        <div className="flex items-center gap-2">
          {todayCompletionPercentage < 100 && (
            <Badge variant="secondary" className="text-xs">
              {todayCompletionPercentage}% complete
            </Badge>
          )}
          
          <Button
            size="sm"
            variant={canSpin() ? "default" : "secondary"}
            onClick={onSpinClick}
            disabled={!canSpin()}
            className={`min-w-[100px] ${canSpin() ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 animate-pulse' : ''}`}
          >
            <Gift className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Daily </span>Spin
            {canSpin() && <span className="ml-1">🎯</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
