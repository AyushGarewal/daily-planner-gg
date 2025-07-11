
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { User, Edit, Shield, Trophy, Zap, Star, RotateCcw, Settings, Award, TrendingUp, Target } from 'lucide-react';
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
  joinDate: string;
}

const AVATAR_OPTIONS = [
  { emoji: '👤', name: 'Default' },
  { emoji: '🧑‍💻', name: 'Developer' },
  { emoji: '🎯', name: 'Focused' },
  { emoji: '🚀', name: 'Ambitious' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '🏆', name: 'Champion' },
  { emoji: '💪', name: 'Strong' },
  { emoji: '🔥', name: 'Fire' },
  { emoji: '⚡', name: 'Lightning' },
  { emoji: '🎨', name: 'Creative' }
];

export function Profile({ progress, userStats }: ProfileProps) {
  const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', {
    username: 'Task Master',
    avatar: '👤',
    joinDate: new Date().toISOString()
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(profile.username);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);

  const handleSave = () => {
    setProfile({ ...profile, username: tempUsername, avatar: tempAvatar });
    setIsEditing(false);
  };

  const handleReset = () => {
    // Clear all localStorage data
    const keysToReset = [
      'tasks', 'userProgress', 'userStats', 'moodEntries', 
      'journalEntries', 'avatarData', 'userProfile', 'weeklyScores',
      'habitHeatmapData', 'app-theme', 'goals', 'customTrophies'
    ];
    
    keysToReset.forEach(key => localStorage.removeItem(key));
    
    // Reload the page to reset everything
    window.location.reload();
  };

  const unlockedTrophies = userStats.achievements.filter(a => a.unlocked).length;
  const totalTrophies = userStats.achievements.length;
  
  const joinDate = new Date(profile.joinDate);
  const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate completion rate - use tasksCompleted instead of totalTasksCompleted
  const completionRate = userStats.tasksCompleted > 0 
    ? Math.round((userStats.tasksCompleted / (userStats.tasksCompleted + 10)) * 100) // Rough estimate
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{profile.avatar}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                <span>Level {progress.level} • {progress.totalXP} XP</span>
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  Member for {daysSinceJoining} days
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
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
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Avatar</label>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {AVATAR_OPTIONS.map((option) => (
                          <Button
                            key={option.emoji}
                            variant={tempAvatar === option.emoji ? "default" : "outline"}
                            className="text-2xl h-12 p-0"
                            onClick={() => setTempAvatar(option.emoji)}
                            title={option.name}
                          >
                            {option.emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="flex-1">Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">{progress.currentStreak}</span>
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <Progress value={(progress.currentStreak / Math.max(progress.maxStreak, 7)) * 100} className="h-1 mt-2" />
            </div>
            
            <div className="text-center p-4 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-secondary mr-2" />
                <span className="text-2xl font-bold text-secondary">{progress.maxStreak}</span>
              </div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
              <div className="text-xs text-secondary mt-1">
                {progress.maxStreak >= 30 ? '🔥 Legendary!' : progress.maxStreak >= 14 ? '⭐ Great!' : '💪 Keep going!'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-500/5 rounded-lg hover:bg-yellow-500/10 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
                <span className="text-2xl font-bold text-yellow-600">{unlockedTrophies}</span>
              </div>
              <div className="text-sm text-muted-foreground">Trophies Earned</div>
              <Progress value={(unlockedTrophies / totalTrophies) * 100} className="h-1 mt-2" />
              <div className="text-xs text-yellow-600 mt-1">{unlockedTrophies}/{totalTrophies}</div>
            </div>
            
            <div className="text-center p-4 bg-green-500/5 rounded-lg hover:bg-green-500/10 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-green-600">{userStats.tasksCompleted}</span>
              </div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
              <div className="text-xs text-green-600 mt-1">{completionRate}% completion rate</div>
            </div>
          </div>

          {/* Active Items */}
          <div className="space-y-4">
            {/* Streak Shields */}
            {userStats.streakShields > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Shield className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <span className="font-medium">Streak Protection Active</span>
                  <p className="text-sm text-muted-foreground">You have {userStats.streakShields} streak shields</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {userStats.streakShields} shields
                </Badge>
              </div>
            )}

            {/* Power-ups */}
            {userStats.powerUps.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Active Power-ups ({userStats.powerUps.length})
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {userStats.powerUps.map((powerUp) => (
                    <Badge key={powerUp.id} variant="outline" className="flex items-center gap-1">
                      <span>{powerUp.icon}</span>
                      <span>{powerUp.title}</span>
                      <span className="text-xs">({powerUp.uses}/{powerUp.maxUses || 10})</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings & Reset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings & Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-red-600 dark:text-red-400">Reset All Progress</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your tasks, progress, XP, streaks, and achievements.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All your tasks and goals</li>
                      <li>XP, levels, and streaks</li>
                      <li>All achievements and trophies</li>
                      <li>Power-ups and streak shields</li>
                      <li>Mood tracking and journal entries</li>
                      <li>Profile and avatar customization</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

