
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Edit, Shield, Trophy, Zap, Star } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserProgress } from '../types/task';
import { UserStats } from '../types/achievements';

interface ProfileProps {
  progress: UserProgress;
  userStats: UserStats;
}

interface UserProfile {
  username: string;
  avatar: string;
}

const AVATAR_OPTIONS = ['👤', '🧑‍💻', '🎯', '🚀', '⭐', '🏆', '💪', '🔥', '⚡', '🎨'];

export function Profile({ progress, userStats }: ProfileProps) {
  const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', {
    username: 'Task Master',
    avatar: '👤'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(profile.username);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);

  const handleSave = () => {
    setProfile({ username: tempUsername, avatar: tempAvatar });
    setIsEditing(false);
  };

  const unlockedTrophies = userStats.achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="text-4xl">{profile.avatar}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.username}</h2>
              <p className="text-muted-foreground">Level {progress.level} • {progress.totalXP} XP</p>
            </div>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Avatar</label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <Button
                          key={emoji}
                          variant={tempAvatar === emoji ? "default" : "outline"}
                          className="text-2xl h-12"
                          onClick={() => setTempAvatar(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{progress.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{progress.maxStreak}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{unlockedTrophies}</div>
              <div className="text-sm text-muted-foreground">Trophies</div>
            </div>
            <div className="text-center p-4 bg-green-500/5 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userStats.totalTasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Tasks Done</div>
            </div>
          </div>

          {/* Streak Shields */}
          {userStats.streakShields > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Streak Shields: {userStats.streakShields}</span>
              <Badge variant="secondary">Active Protection</Badge>
            </div>
          )}

          {/* Power-ups */}
          {userStats.powerUps.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Active Power-ups
              </h3>
              <div className="flex gap-2 flex-wrap">
                {userStats.powerUps.map((powerUp) => (
                  <Badge key={powerUp.id} variant="outline">
                    {powerUp.icon} {powerUp.title} ({powerUp.uses})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
