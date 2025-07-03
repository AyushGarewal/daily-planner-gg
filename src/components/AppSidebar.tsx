
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Calendar, List, BarChart3, Heart, Trophy, Zap, User, Sun, Clock, FolderOpen, Moon, Backpack, Plus, Minus } from 'lucide-react';
import { Avatar } from './Avatar';
import { XPBar } from './XPBar';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  progress?: {
    totalXP: number;
    level: number;
    currentStreak: number;
    maxStreak: number;
    lastCompletionDate?: Date;
  };
}

const mainItems = [
  { title: 'Today', value: 'today', icon: Sun },
  { title: 'This Week', value: 'week', icon: Calendar },
  { title: 'Monthly', value: 'monthly', icon: Calendar },
  { title: 'All Tasks', value: 'all', icon: List },
];

const planningItems = [
  { title: 'Long-term Goals', value: 'long-term-goals', icon: BarChart3 },
  { title: 'Routines', value: 'routines', icon: Clock },
  { title: 'Projects', value: 'projects', icon: FolderOpen },
  { title: 'Challenges', value: 'challenges', icon: Trophy },
  { title: 'Side Habits', value: 'side-habits', icon: Plus },
  { title: 'Negative Habits', value: 'negative-habits', icon: Minus },
];

const trackingItems = [
  { title: 'Sleep Tracker', value: 'sleep', icon: Moon },
  { title: 'Wellness', value: 'wellness', icon: Heart },
  { title: 'Habit Performance', value: 'habit-performance', icon: BarChart3 },
];

const gameItems = [
  { title: 'Spin Wheel', value: 'spin-wheel', icon: Zap },
  { title: 'Trophies', value: 'trophies', icon: Trophy },
  { title: 'Inventory', value: 'inventory', icon: Backpack },
];

export function AppSidebar({ activeTab, onTabChange, progress }: AppSidebarProps) {
  const { state } = useSidebar();

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
  };

  // Default progress if not provided
  const defaultProgress = {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
  };

  const currentProgress = progress || defaultProgress;

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* User Profile Section - At the top */}
        <SidebarGroup>
          <SidebarGroupLabel>Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleTabClick('profile')}
                  className={activeTab === 'profile' ? 'bg-accent text-accent-foreground' : ''}
                >
                  <User className="mr-2 h-4 w-4" />
                  {state !== "collapsed" && <span>Profile</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleTabClick('avatar')}
                  className={activeTab === 'avatar' ? 'bg-accent text-accent-foreground' : ''}
                >
                  <User className="mr-2 h-4 w-4" />
                  {state !== "collapsed" && <span>Avatar</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Avatar and Progress Section */}
        {state !== "collapsed" && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-2 py-4 space-y-3">
                <div className="flex justify-center">
                  <Avatar progress={currentProgress} size="small" showDetails={false} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Level {currentProgress.level}</p>
                  <p className="text-xs text-muted-foreground">{currentProgress.totalXP} XP</p>
                </div>
                <XPBar progress={currentProgress} className="text-xs" />
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Tasks */}
        <SidebarGroup>
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => handleTabClick(item.value)}
                    className={activeTab === item.value ? 'bg-accent text-accent-foreground' : ''}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Planning & Organization */}
        <SidebarGroup>
          <SidebarGroupLabel>Planning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {planningItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => handleTabClick(item.value)}
                    className={activeTab === item.value ? 'bg-accent text-accent-foreground' : ''}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Health & Tracking */}
        <SidebarGroup>
          <SidebarGroupLabel>Tracking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trackingItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => handleTabClick(item.value)}
                    className={activeTab === item.value ? 'bg-accent text-accent-foreground' : ''}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gamification */}
        <SidebarGroup>
          <SidebarGroupLabel>Gamification</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {gameItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => handleTabClick(item.value)}
                    className={activeTab === item.value ? 'bg-accent text-accent-foreground' : ''}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
