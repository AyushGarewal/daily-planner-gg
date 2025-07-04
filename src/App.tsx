
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TaskGamificationApp } from './components/TaskGamificationApp';
import { HabitPerformanceTracker } from './components/HabitPerformanceTracker';
import { SideHabitsPanel } from './components/SideHabitsPanel';
import { NegativeHabitsPanel } from './components/NegativeHabitsPanel';
import { ProjectManager } from './components/ProjectManager';
import { LongTermGoals } from './components/LongTermGoals';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './components/AppSidebar';
import { useTasks } from './hooks/useTasks';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const { progress } = useTasks();

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
      case 'week':
      case 'monthly':
      case 'all':
        return <TaskGamificationApp />;
      case 'habit-performance':
        return <HabitPerformanceTracker />;
      case 'side-habits':
        return <SideHabitsPanel />;
      case 'negative-habits':
        return <NegativeHabitsPanel />;
      case 'projects':
        return <ProjectManager />;
      case 'long-term-goals':
        return <LongTermGoals />;
      case 'profile':
        return <div className="p-6"><h1 className="text-2xl font-bold">Profile</h1><p>Profile settings will be available here.</p></div>;
      case 'avatar':
        return <div className="p-6"><h1 className="text-2xl font-bold">Avatar</h1><p>Avatar customization will be available here.</p></div>;
      case 'routines':
        return <div className="p-6"><h1 className="text-2xl font-bold">Routines</h1><p>Routine management will be available here.</p></div>;
      case 'challenges':
        return <div className="p-6"><h1 className="text-2xl font-bold">Challenges</h1><p>Challenge system will be available here.</p></div>;
      case 'sleep':
        return <div className="p-6"><h1 className="text-2xl font-bold">Sleep Tracker</h1><p>Sleep tracking will be available here.</p></div>;
      case 'wellness':
        return <div className="p-6"><h1 className="text-2xl font-bold">Wellness</h1><p>Wellness tracking will be available here.</p></div>;
      case 'spin-wheel':
        return <div className="p-6"><h1 className="text-2xl font-bold">Spin Wheel</h1><p>Gamification wheel will be available here.</p></div>;
      case 'trophies':
        return <div className="p-6"><h1 className="text-2xl font-bold">Trophies</h1><p>Achievement trophies will be available here.</p></div>;
      case 'inventory':
        return <div className="p-6"><h1 className="text-2xl font-bold">Inventory</h1><p>Item inventory will be available here.</p></div>;
      default:
        return <TaskGamificationApp />;
    }
  };

  return (
    <Router>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            progress={progress}
          />
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;
