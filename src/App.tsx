
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Today } from './components/Today';
import { WeekView } from './components/WeekView';
import { MonthlyView } from './components/MonthlyView';
import { AllTasks } from './components/AllTasks';
import { LongTermGoals } from './components/LongTermGoals';
import { Routines } from './components/Routines';
import { Projects } from './components/Projects';
import { Challenges } from './components/Challenges';
import { SideHabitsPanel } from './components/SideHabitsPanel';
import { NegativeHabitsPage } from './components/NegativeHabitsPage';
import { SleepTracker } from './components/SleepTracker';
import { Wellness } from './components/Wellness';
import { HabitPerformanceTracker } from './components/HabitPerformanceTracker';
import { SpinWheel } from './components/SpinWheel';
import { Trophies } from './components/Trophies';
import { Inventory } from './components/Inventory';
import { Profile } from './components/Profile';
import { Avatar } from './components/Avatar';
import { useTasks } from './hooks/useTasks';
import { useAchievements } from './hooks/useAchievements';
import { SPIN_REWARDS } from './data/achievements';
import { SpinReward } from './types/achievements';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  
  const { 
    progress, 
    getTodayCompletionPercentage,
    canUseDaily,
    markDailyUsed,
    addBonusXP
  } = useTasks();
  
  const { unlockAchievement } = useAchievements();

  // Check if user completed all tasks today and show spin wheel
  useEffect(() => {
    const todayCompletion = getTodayCompletionPercentage();
    const canSpin = canUseDaily('spinUsed');
    
    if (todayCompletion === 100 && canSpin) {
      setShowSpinWheel(true);
    }
  }, [getTodayCompletionPercentage, canUseDaily]);

  const handleSpinReward = (reward: SpinReward) => {
    console.log('Spin reward received:', reward);
    
    // Handle different reward types
    switch (reward.type) {
      case 'xp':
        if (typeof reward.value === 'number') {
          addBonusXP(reward.value);
        }
        break;
      case 'power-up':
        // Power-ups are handled by the power-up system
        break;
      case 'streak-shield':
        // Streak shield activation is handled elsewhere
        break;
      case 'xp-multiplier':
        // XP multiplier activation is handled in SpinWheel component
        break;
    }
    
    // Mark spin as used for today
    markDailyUsed('spinUsed');
    
    // Check for achievements
    unlockAchievement('first_spin');
  };

  const handleCloseSpinWheel = () => {
    setShowSpinWheel(false);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'today':
        return <Today />;
      case 'week':
        return <WeekView />;
      case 'monthly':
        return <MonthlyView />;
      case 'all':
        return <AllTasks />;
      case 'long-term-goals':
        return <LongTermGoals />;
      case 'routines':
        return <Routines />;
      case 'projects':
        return <Projects />;
      case 'challenges':
        return <Challenges />;
      case 'side-habits':
        return <SideHabitsPanel />;
      case 'negative-habits':
        return <NegativeHabitsPage />;
      case 'sleep':
        return <SleepTracker />;
      case 'wellness':
        return <Wellness />;
      case 'habit-performance':
        return <HabitPerformanceTracker />;
      case 'spin-wheel':
        return <SpinWheel onReward={handleSpinReward} onClose={() => setActiveTab('today')} />;
      case 'trophies':
        return <Trophies />;
      case 'inventory':
        return <Inventory />;
      case 'profile':
        return <Profile />;
      case 'avatar':
        return <Avatar progress={progress} size="large" showDetails={true} />;
      default:
        return <Today />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          progress={progress}
        />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto p-4 space-y-6">
              {renderActiveTab()}
            </div>
          </div>
        </main>

        {showSpinWheel && (
          <SpinWheel 
            onReward={handleSpinReward} 
            onClose={handleCloseSpinWheel} 
          />
        )}

        <Toaster />
      </div>
    </SidebarProvider>
  );
}

export default App;
