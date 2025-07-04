
import React, { useState, useEffect } from 'react';
import { TaskManager } from './TaskManager';
import { XPBar } from './XPBar';
import { ProgressTracker } from './ProgressTracker';
import { useTasks } from '../hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SideHabitsPanel } from './SideHabitsPanel';
import { NegativeHabitsPanel } from './NegativeHabitsPanel';
import { Calendar, CheckCircle2, Trophy, Plus, ArrowRight, TrendingUp, Zap, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserProfile } from './UserProfile';

export function TaskGamificationApp() {
  const { 
    progress, 
    getTodaysTasks, 
    getTodayCompletionPercentage,
    bonusXP 
  } = useTasks();
  
  const [showProfile, setShowProfile] = useState(false);
  const todaysTasks = getTodaysTasks();
  const completedTasks = todaysTasks.filter(task => task.completed);
  const pendingTasks = todaysTasks.filter(task => !task.completed);
  const todayCompletionPercentage = getTodayCompletionPercentage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with only profile button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Gamification Dashboard</h1>
            <p className="text-muted-foreground">Level up your productivity!</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showProfile} onOpenChange={setShowProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>User Profile</DialogTitle>
                </DialogHeader>
                <UserProfile />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* XP and Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <XPBar progress={progress} />
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Today's Tasks</span>
                <Badge variant="outline">{completedTasks.length}/{todaysTasks.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Streak</span>
                <Badge className="bg-orange-500">{progress.currentStreak} days</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bonus XP</span>
                <Badge className="bg-purple-500">+{bonusXP}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <ProgressTracker 
          progress={progress} 
          todayCompletionPercentage={todayCompletionPercentage}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="side-habits" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Side Habits
            </TabsTrigger>
            <TabsTrigger value="negative-habits" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Negative Habits
            </TabsTrigger>
            <TabsTrigger value="all-tasks" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              All Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Today's Focus
                    <Badge variant="secondary" className="ml-auto">
                      {format(new Date(), 'MMM dd')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingTasks.length > 0 ? (
                    <div className="space-y-3">
                      {pendingTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.title}</span>
                            <Badge variant="outline">+{task.xpValue} XP</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {task.category} • {task.priority} Priority
                          </div>
                        </div>
                      ))}
                      {pendingTasks.length > 3 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-muted-foreground">
                            +{pendingTasks.length - 3} more tasks
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">All caught up!</p>
                      <p className="text-sm">No pending tasks for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Recent Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completedTasks.length > 0 ? (
                    <div className="space-y-3">
                      {completedTasks.slice(-3).map((task) => (
                        <div key={task.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-green-800 dark:text-green-200">
                              {task.title}
                            </span>
                            <Badge className="bg-green-500">+{task.xpValue} XP</Badge>
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Completed today
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Ready to win?</p>
                      <p className="text-sm">Complete tasks to see them here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <TaskManager />
          </TabsContent>

          <TabsContent value="side-habits">
            <SideHabitsPanel />
          </TabsContent>

          <TabsContent value="negative-habits">
            <NegativeHabitsPanel />
          </TabsContent>

          <TabsContent value="all-tasks">
            <TaskManager showAllTasks={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
