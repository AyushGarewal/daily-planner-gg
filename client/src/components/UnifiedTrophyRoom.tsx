
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Lock, Plus, Star } from 'lucide-react';
import { Achievement, CustomTrophy } from '../types/achievements';
import { CustomTrophyManager } from './CustomTrophyManager';
import { format } from 'date-fns';

interface UnifiedTrophyRoomProps {
  achievements: Achievement[];
  customTrophies: CustomTrophy[];
  onTrophyCheck: (trophies: CustomTrophy[]) => void;
}

export function UnifiedTrophyRoom({ achievements, customTrophies, onTrophyCheck }: UnifiedTrophyRoomProps) {
  const [activeTab, setActiveTab] = useState('all');
  
  const regularAchievements = achievements.filter(a => !a.isCustom);
  const customAchievementsFromRegular = achievements.filter(a => a.isCustom);
  const allCustomTrophies = [...customTrophies, ...customAchievementsFromRegular];
  
  const totalUnlocked = achievements.filter(a => a.unlocked).length + customTrophies.filter(t => t.unlocked).length;
  const totalCount = achievements.length + customTrophies.length;
  const regularUnlocked = regularAchievements.filter(a => a.unlocked).length;
  const customUnlocked = allCustomTrophies.filter(t => t.unlocked).length;

  const renderAchievement = (achievement: Achievement) => (
    <Card 
      key={achievement.id} 
      className={`transition-all duration-200 ${
        achievement.unlocked 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/30 dark:to-orange-900/30' 
          : 'opacity-60 bg-gray-50 dark:bg-gray-900/30'
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {achievement.unlocked ? achievement.icon : <Lock className="h-8 w-8 text-gray-400" />}
            </span>
            <div>
              <CardTitle className="text-lg">{achievement.title}</CardTitle>
              <div className="flex gap-2 mt-1">
                {achievement.unlocked && achievement.unlockedAt && (
                  <Badge variant="secondary" className="text-xs">
                    {format(new Date(achievement.unlockedAt), 'MMM dd, yyyy')}
                  </Badge>
                )}
                {achievement.xpReward && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    +{achievement.xpReward} XP
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {achievement.description}
        </p>
      </CardContent>
    </Card>
  );

  const renderCustomTrophy = (trophy: CustomTrophy) => (
    <Card 
      key={trophy.id} 
      className={`transition-all duration-200 ${
        trophy.unlocked 
          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/30 dark:to-pink-900/30' 
          : 'opacity-60 bg-gray-50 dark:bg-gray-900/30'
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {trophy.unlocked ? trophy.icon : <Lock className="h-8 w-8 text-gray-400" />}
            </span>
            <div>
              <CardTitle className="text-lg">{trophy.name}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                  Custom
                </Badge>
                {trophy.unlocked && trophy.unlockedAt && (
                  <Badge variant="secondary" className="text-xs">
                    {format(new Date(trophy.unlockedAt), 'MMM dd, yyyy')}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  +{trophy.xpReward} XP
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {trophy.description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Trophy Collection
        </h2>
        <p className="text-muted-foreground">
          {totalUnlocked} of {totalCount} trophies unlocked
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({totalUnlocked}/{totalCount})
          </TabsTrigger>
          <TabsTrigger value="achievements">
            Achievements ({regularUnlocked}/{regularAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="custom">
            Custom ({customUnlocked}/{allCustomTrophies.length})
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="h-4 w-4 mr-1" />
            Create
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularAchievements.map(renderAchievement)}
            {allCustomTrophies.map(renderCustomTrophy)}
          </div>
          {totalCount === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trophies available yet. Create your first custom trophy!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularAchievements.map(renderAchievement)}
          </div>
          {regularAchievements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No regular achievements available yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCustomTrophies.map(renderCustomTrophy)}
          </div>
          {allCustomTrophies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom trophies created yet. Switch to the Create tab to make your first one!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <CustomTrophyManager onTrophyCheck={() => { onTrophyCheck([]); return []; }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
