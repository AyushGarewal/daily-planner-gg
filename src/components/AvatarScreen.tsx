
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Settings, Heart, Sparkles } from 'lucide-react';
import { Avatar } from './Avatar';
import { XPBar } from './XPBar';
import { UserProgress } from '../types/task';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AvatarScreenProps {
  progress: UserProgress;
}

interface AvatarData {
  name: string;
  mood: 'happy' | 'neutral' | 'sad' | 'tired';
  energy: number;
}

export function AvatarScreen({ progress }: AvatarScreenProps) {
  const [avatarData, setAvatarData] = useLocalStorage<AvatarData>('avatarData', {
    name: 'Buddy',
    mood: 'happy',
    energy: 100,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(avatarData.name);

  const handleSaveName = () => {
    setAvatarData(prev => ({ ...prev, name: tempName }));
    setIsEditing(false);
  };

  const getEvolutionStage = () => {
    if (progress.level >= 10) return 'Productivity Master';
    if (progress.level >= 7) return 'Task Wizard';
    if (progress.level >= 5) return 'Efficiency Expert';
    if (progress.level >= 3) return 'Goal Achiever';
    return 'Task Beginner';
  };

  const getNextEvolution = () => {
    if (progress.level >= 10) return 'Maximum Level Reached!';
    if (progress.level >= 7) return 'Productivity Master at Level 10';
    if (progress.level >= 5) return 'Task Wizard at Level 7';
    if (progress.level >= 3) return 'Efficiency Expert at Level 5';
    return 'Goal Achiever at Level 3';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Your Productivity Avatar</h1>
        <p className="text-muted-foreground">Meet your companion on the journey to productivity mastery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar Display */}
        <div className="space-y-4">
          <Avatar progress={progress} size="large" />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Avatar Settings
                </span>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Name
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Avatar Name</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Enter avatar name"
                        maxLength={20}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveName} className="flex-1">
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)} 
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Stage</span>
                <span className="font-medium">{getEvolutionStage()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Next Evolution</span>
                <span className="font-medium text-primary">{getNextEvolution()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mood Status</span>
                <span className="font-medium">
                  {progress.currentStreak >= 7 ? 'Extremely Happy' :
                   progress.currentStreak >= 3 ? 'Happy' :
                   progress.currentStreak >= 1 ? 'Content' : 'Needs Motivation'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Progress */}
        <div className="space-y-4">
          <XPBar progress={progress} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Avatar Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{progress.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{progress.maxStreak}</div>
                  <div className="text-sm text-muted-foreground">Best Streak</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Energy Level</span>
                  <span className="font-medium">{avatarData.energy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Happiness</span>
                  <span className="font-medium">
                    {progress.currentStreak >= 5 ? 'Very High' :
                     progress.currentStreak >= 3 ? 'High' :
                     progress.currentStreak >= 1 ? 'Good' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Productivity Score</span>
                  <span className="font-medium">{Math.min(100, progress.level * 10 + progress.currentStreak * 5)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Care Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>• Complete daily tasks to keep your avatar happy and energized</p>
                <p>• Maintain streaks to unlock new evolution stages</p>
                <p>• Use power-ups to boost your avatar's mood</p>
                <p>• Check in regularly to prevent energy depletion</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
