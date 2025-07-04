
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TaskGamificationApp } from './components/TaskGamificationApp';
import { HabitPerformanceTracker } from './components/HabitPerformanceTracker';
import { SideHabitsPanel } from './components/SideHabitsPanel';
import { NegativeHabitsPanel } from './components/NegativeHabitsPanel';
import { ProjectManager } from './components/ProjectManager';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './components/AppSidebar';
import { useTasks } from './hooks/useTasks';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const { progress } = useTasks();

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
            <div className="p-6">
              <Routes>
                <Route path="/" element={<TaskGamificationApp />} />
                <Route path="/habits" element={<HabitPerformanceTracker />} />
                <Route path="/side-habits" element={<SideHabitsPanel />} />
                <Route path="/negative-habits" element={<NegativeHabitsPanel />} />
                <Route path="/projects" element={<ProjectManager />} />
              </Routes>
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;
