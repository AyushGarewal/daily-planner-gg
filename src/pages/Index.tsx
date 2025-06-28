import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Plus, Calendar, List, BarChart3, Heart, Trophy, Zap, Gift, Sun, Moon, User, Menu, Palette } from 'lucide-react';
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
import { AppSidebar } from '../components/AppSidebar';
import { Avatar } from '../components/Avatar';
import { XPBar } from '../components/XPBar';
import { AvatarScreen } from '../components/AvatarScreen';
import { SpinWheelCenter } from '../components/SpinWheelCenter';
import { ThemeSelector } from '../components/ThemeSelector';
import { Task } from '../types/task';
import { Achievement, SpinReward } from '../types/achievements';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { THEMES } from '../data/achievements';
import { Profile } from '../components/Profile';
import { CustomTrophyManager } from '../components/CustomTrophyManager';
import { WeeklyPerformanceTracker } from '../components/WeeklyPerformanceTracker';
import { HabitHeatmap } from '../components/HabitHeatmap';
import { useIsMobile } from '../hooks/use-mobile';
import { LongTermGoals } from '../components/LongTermGoals';
import { StatusBar } from '../components/StatusBar';
import { Inventory } from '../components/Inventory';

const Index = () => {
  const { 
    tasks, 
    progress, 
    bonusXP,
    addTask, 
    updateTask, 
    deleteTask, 
    completeTask,
    addBonusXP,
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
    useStreakShield,
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
  const [currentTheme, setCurrentTheme] = useState('light');
  
  const isMobile = useIsMobile();
  
  // Filter and sort states with proper typing
  const [filters, setFilters] = useState<{
    category?: string;
    priority?: string;
    completed?: boolean;
  }>({});
  const [sortBy, setSortBy] = useState<'dueDate' | 'xpValue' | 'priority'>('dueDate');

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
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    setCurrentTheme(savedTheme);
    
    if (savedTheme === 'dark' || isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('vibrant', 'pastel', 'neon', 'monochrome', 'minimal');
    } else if (savedTheme === 'vibrant') {
      root.classList.add('vibrant');
      root.classList.remove('dark', 'pastel', 'neon', 'monochrome', 'minimal');
    } else if (savedTheme === 'pastel') {
      root.classList.add('pastel');
      root.classList.remove('dark', 'vibrant', 'neon', 'monochrome', 'minimal');
    } else if (savedTheme === 'neon') {
      root.classList.add('neon');
      root.classList.remove('dark', 'vibrant', 'pastel', 'monochrome', 'minimal');
    } else if (savedTheme === 'monochrome') {
      root.classList.add('monochrome');
      root.classList.remove('dark', 'vibrant', 'pastel', 'neon', 'minimal');
    } else if (savedTheme === 'minimal') {
      root.classList.add('minimal');
      root.classList.remove('dark', 'vibrant', 'pastel', 'neon', 'monochrome');
    } else {
      root.classList.remove('dark', 'vibrant', 'pastel', 'neon', 'monochrome');
    }
  }, [userStats.theme, isDarkMode, currentTheme]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', theme);
    setTheme(theme);
    
    const root = document.documentElement;
    root.classList.remove('dark', 'vibrant', 'pastel', 'neon', 'monochrome', 'minimal');
    
    if (theme !== 'light') {
      root.classList.add(theme);
    }
    
    setIsDarkMode(theme === 'dark' || theme === 'neon');
  };

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
    
    const completionPercentage = getTodayCompletionPercentage();
    if (completionPercentage === 100 && canSpin()) {
      setTimeout(() => setShowSpinWheel(true), 1000);
    }
  };

  const handleSpinReward = (reward: SpinReward) => {
    recordSpin();
    
    switch (reward.type) {
      case 'xp':
        // Store bonus XP to be used from inventory
        const currentBonusXP = localStorage.getItem('bonusXP');
        const newBonusXP = (currentBonusXP ? parseInt(currentBonusXP) : 0) + (reward.value as number);
        localStorage.setItem('bonusXP', newBonusXP.toString());
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

  const handleUseXPBoost = (amount: number) => {
    addBonusXP(amount);
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
    <SidebarProvider>
      <div className="min-h-screen bg-background transition-colors duration-300 flex w-full">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Mobile-First Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center justify-between p-3 sm:p-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <SidebarTrigger className="shrink-0 min-h-[44px] min-w-[44px]" />
                <div className="hidden sm:block min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold truncate">Task Planner</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Stay productive and build great habits</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-base font-bold">Tasks</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile Avatar */}
                <div className="block sm:hidden">
                  <Avatar progress={progress} size="small" showDetails={false} />
                </div>
                
                {/* Desktop Avatar */}
                <div className="hidden sm:block">
                  <Avatar progress={progress} size="small" showDetails={true} />
                </div>
                
                {/* Theme Toggle */}
                <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
                
                {/* Add Task Button */}
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 min-h-[44px]" size={isMobile ? "sm" : "default"}>
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Task</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
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
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto p-3 sm:p-4 max-w-6xl">
            {/* XP Bar - Always visible */}
            <div className="mb-4 sm:mb-6">
              <XPBar progress={progress} />
            </div>

            {/* Status Bar - Mobile optimized */}
            <div className="mb-4 sm:mb-6">
              <StatusBar
                userStats={userStats}
                progress={progress}
                canSpin={canSpin}
                todayCompletionPercentage={todayCompletionPercentage}
                onSpinClick={() => setShowSpinWheel(true)}
              />
            </div>

            {/* Progress Tracker */}
            <div className="mb-4 sm:mb-6">
              <ProgressTracker 
                progress={progress} 
                todayCompletionPercentage={todayCompletionPercentage} 
              />
            </div>

            {/* Content based on active tab */}
            {activeTab === 'today' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold">Today's Tasks ({visibleTodaysTasks.length})</h2>
                  {shouldShowSurplusTasks() && (
                    <div className="text-sm text-purple-600 font-medium animate-pulse">
                      🎉 Surplus tasks unlocked!
                    </div>
                  )}
                </div>
                
                {visibleTodaysTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-lg mb-2">No tasks for today!</p>
                    <p className="text-sm">Add some tasks to get started on your productivity journey.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {visibleTodaysTasks.map((task) => (
                      <div key={task.id} className="transform transition-all duration-200 hover:scale-[1.01]">
                        <TaskCard
                          task={task}
                          onComplete={handleCompleteTask}
                          onEdit={setEditingTask}
                          onDelete={deleteTask}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'week' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg sm:text-xl font-semibold">This Week</h2>
                <div className="grid gap-3 sm:gap-4">
                  {weekDays.map((day) => {
                    const dayTasks = getTasksForDate(day);
                    const isToday = day.toDateString() === today.toDateString();
                    
                    return (
                      <div key={day.toISOString()} className={`p-3 sm:p-4 rounded-lg border transition-colors ${isToday ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:bg-muted/30'}`}>
                        <h3 className="font-medium mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-sm sm:text-base">{format(day, 'EEEE, MMM dd')}</span>
                          <div className="flex items-center gap-2">
                            {isToday && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Today</span>}
                            <span className="text-xs sm:text-sm text-muted-foreground">({dayTasks.length} tasks)</span>
                          </div>
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
            )}

            {activeTab === 'long-term-goals' && (
              <div className="animate-fade-in">
                <LongTermGoals />
              </div>
            )}

            {activeTab === 'spin-wheel' && (
              <SpinWheelCenter 
                canSpin={canSpin}
                todayCompletionPercentage={todayCompletionPercentage}
                onSpin={() => setShowSpinWheel(true)}
              />
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <Profile progress={progress} userStats={userStats} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <HabitHeatmap />
                  <WeeklyPerformanceTracker />
                </div>
              </div>
            )}

            {activeTab === 'avatar' && (
              <div className="animate-fade-in">
                <AvatarScreen progress={progress} />
              </div>
            )}

            {activeTab === 'trophies' && (
              <div className="animate-fade-in">
                <TrophyRoom achievements={userStats.achievements} />
              </div>
            )}

            {activeTab === 'custom-trophies' && (
              <div className="animate-fade-in">
                <CustomTrophyManager onTrophyCheck={() => []} />
              </div>
            )}

            {activeTab === 'powerups' && (
              <div className="animate-fade-in">
                <Inventory 
                  powerUps={userStats.powerUps}
                  streakShields={userStats.streakShields}
                  bonusXP={bonusXP}
                  onUsePowerUp={handleUsePowerUp}
                  onUseStreakShield={useStreakShield}
                  onUseXPBoost={handleUseXPBoost}
                />
              </div>
            )}

            {activeTab === 'wellness' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <h2 className="text-lg sm:text-xl font-semibold">Wellness & Insights</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <MoodTracker />
                  <JournalPrompt />
                </div>
                
                <ProductivityChart />
              </div>
            )}

            {activeTab === 'all' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold">All Tasks ({tasks.length})</h2>
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
                  <div className="grid gap-3 sm:gap-4">
                    {finalTasks.map((task) => (
                      <div key={task.id} className="transform transition-all duration-200 hover:scale-[1.01]">
                        <TaskCard
                          task={task}
                          onComplete={handleCompleteTask}
                          onEdit={setEditingTask}
                          onDelete={deleteTask}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
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
    </SidebarProvider>
  );
};

export default Index;
