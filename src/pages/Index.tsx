import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, List, BarChart3, Heart, Trophy, Zap, Gift, Sun, Moon } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useAchievements } from '../hooks/useAchievements';
import { TaskForm } from '../components/TaskForm';
import { TaskCard } from '../components/TaskCard';
import { ProgressTracker } from '../components/ProgressTracker';
import { MoodTracker } from '../components/MoodTracker';
import { JournalPrompt } from '../components/JournalPrompt';
import { ProductivityChart } from '../components/ProductivityChart';
import { TrophyRoom } from '../components/TrophyRoom';
import { PowerUpManager } from '../components/PowerUpManager';
import { SpinWheel } from '../components/SpinWheel';
import { AchievementNotification } from '../components/AchievementNotification';
import { TaskFilters } from '../components/TaskFilters';
import { Task } from '../types/task';
import { Achievement, SpinReward } from '../types/achievements';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { THEMES } from '../data/achievements';

const Index = () => {
  const { 
    tasks, 
    progress, 
    addTask, 
    updateTask, 
    deleteTask, 
    completeTask, 
    getTodaysTasks, 
    getTodayCompletionPercentage,
    shouldShowSurplusTasks,
    getVisibleTodaysTasks,
    getTasksForDate,
    filterTasks,
    sortTasks
  } = useTasks();
  
  const {
    userStats,
    checkAchievements,
    addPowerUp,
    usePowerUp,
    addStreakShield,
    canSpin,
    recordSpin,
    setTheme
  } = useAchievements();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('today');
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Filter and sort states
  const [filters, setFilters] = useState<{
    category?: string;
    priority?: string;
    completed?: boolean;
  }>({});
  const [sortBy, setSortBy] = useState('dueDate');

  // Check for achievements whenever tasks or progress change
  useEffect(() => {
    const newAchievements = checkAchievements(progress, tasks);
    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]); // Show first new achievement
    }
  }, [tasks, progress]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (userStats.theme === 'dark' || isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [userStats.theme, isDarkMode]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    addTask(taskData);
    setIsFormOpen(false);
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const handleCompleteTask = (id: string) => {
    completeTask(id);
    
    // Check if user can spin after completing task
    const completionPercentage = getTodayCompletionPercentage();
    if (completionPercentage === 100 && canSpin()) {
      setTimeout(() => setShowSpinWheel(true), 1000);
    }
  };

  const handleSpinReward = (reward: SpinReward) => {
    recordSpin();
    
    switch (reward.type) {
      case 'xp':
        // Add bonus XP to progress
        break;
      case 'power-up':
        addPowerUp({
          id: `${reward.value}-${Date.now()}`,
          title: reward.title,
          description: 'Earned from daily spin',
          icon: '⚡',
          uses: 1,
          maxUses: 1,
          type: reward.value as any
        });
        break;
      case 'streak-shield':
        addStreakShield(reward.value as number);
        break;
    }
  };

  const handleUsePowerUp = (powerUpId: string) => {
    const powerUp = userStats.powerUps.find(p => p.id === powerUpId);
    if (!powerUp) return;

    if (powerUp.type === 'auto-complete') {
      const incompleteTasks = getVisibleTodaysTasks().filter(t => !t.completed);
      if (incompleteTasks.length > 0) {
        handleCompleteTask(incompleteTasks[0].id);
      }
    }
    
    usePowerUp(powerUpId);
  };

  const visibleTodaysTasks = getVisibleTodaysTasks();
  const todayCompletionPercentage = getTodayCompletionPercentage();

  // Get this week's days for weekly view
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get filtered and sorted tasks for the all tasks view
  const filteredTasks = filterTasks(filters);
  const sortedTasks = sortTasks(sortBy);
  const finalTasks = filters.category || filters.priority || filters.completed !== undefined 
    ? filteredTasks 
    : sortedTasks;

  const availableThemes = THEMES.filter(theme => theme.unlockLevel <= progress.level);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Task Planner</h1>
            <p className="text-muted-foreground">Stay productive and build great habits</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newTheme = isDarkMode ? 'light' : 'dark';
                setIsDarkMode(!isDarkMode);
                setTheme(newTheme);
              }}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Streak Shield Counter */}
            {userStats.streakShields > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-md">
                <span className="text-sm">🛡️ {userStats.streakShields}</span>
              </div>
            )}
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <TaskForm
                  onSubmit={handleAddTask}
                  onCancel={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-6">
          <ProgressTracker 
            progress={progress} 
            todayCompletionPercentage={todayCompletionPercentage} 
          />
        </div>

        {/* Task Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="today" className="gap-2">
              <List className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <Calendar className="h-4 w-4" />
              Week
            </TabsTrigger>
            <TabsTrigger value="trophies" className="gap-2">
              <Trophy className="h-4 w-4" />
              Trophies
            </TabsTrigger>
            <TabsTrigger value="powerups" className="gap-2">
              <Zap className="h-4 w-4" />
              Power-Ups
            </TabsTrigger>
            <TabsTrigger value="wellness" className="gap-2">
              <Heart className="h-4 w-4" />
              Wellness
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <List className="h-4 w-4" />
              All Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Today's Tasks ({visibleTodaysTasks.length})</h2>
                {shouldShowSurplusTasks() && (
                  <div className="text-sm text-purple-600 font-medium">
                    🎉 Surplus tasks unlocked!
                  </div>
                )}
              </div>
              
              {visibleTodaysTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks for today. Add some tasks to get started!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {visibleTodaysTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onEdit={setEditingTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="week" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">This Week</h2>
              <div className="grid gap-4">
                {weekDays.map((day) => {
                  const dayTasks = getTasksForDate(day);
                  const isToday = day.toDateString() === today.toDateString();
                  
                  return (
                    <div key={day.toISOString()} className={`p-4 rounded-lg border ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        {format(day, 'EEEE, MMM dd')}
                        {isToday && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Today</span>}
                        <span className="text-sm text-muted-foreground">({dayTasks.length} tasks)</span>
                      </h3>
                      
                      {dayTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tasks scheduled</p>
                      ) : (
                        <div className="space-y-2">
                          {dayTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onComplete={handleCompleteTask}
                              onEdit={setEditingTask}
                              onDelete={deleteTask}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trophies" className="mt-6">
            <TrophyRoom achievements={userStats.achievements} />
          </TabsContent>

          <TabsContent value="powerups" className="mt-6">
            <PowerUpManager 
              powerUps={userStats.powerUps} 
              onUsePowerUp={handleUsePowerUp} 
            />
          </TabsContent>

          <TabsContent value="wellness" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Wellness & Insights</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MoodTracker />
                <JournalPrompt />
              </div>
              
              <ProductivityChart />
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Tasks ({tasks.length})</h2>
              </div>
              
              <TaskFilters
                filters={filters}
                sortBy={sortBy}
                onFilterChange={setFilters}
                onSortChange={setSortBy}
                onClearFilters={() => setFilters({})}
              />
              
              {finalTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks match your current filters.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {finalTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onEdit={setEditingTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Task Dialog */}
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <TaskForm
                initialTask={editingTask}
                onSubmit={handleEditTask}
                onCancel={() => setEditingTask(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Spin Wheel Modal */}
        {showSpinWheel && (
          <SpinWheel
            onReward={handleSpinReward}
            onClose={() => setShowSpinWheel(false)}
          />
        )}

        {/* Achievement Notification */}
        {newAchievement && (
          <AchievementNotification
            achievement={newAchievement}
            onClose={() => setNewAchievement(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
