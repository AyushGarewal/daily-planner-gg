
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Lock } from 'lucide-react';
import { Achievement } from '../types/achievements';
import { format } from 'date-fns';

interface TrophyRoomProps {
  achievements: Achievement[];
}

export function TrophyRoom({ achievements }: TrophyRoomProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Trophy Room
        </h2>
        <p className="text-muted-foreground">
          {unlockedCount} of {achievements.length} achievements unlocked
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`transition-all duration-200 ${
              achievement.unlocked 
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                : 'opacity-60 bg-gray-50'
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
                    {achievement.unlocked && achievement.unlockedAt && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {format(new Date(achievement.unlockedAt), 'MMM dd, yyyy')}
                      </Badge>
                    )}
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
        ))}
      </div>
    </div>
  );
}
