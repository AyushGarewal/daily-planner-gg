
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
import { Calendar, List, BarChart3, Heart, Trophy, Zap, User, Sun, Clock, FolderOpen, Moon } from 'lucide-react';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
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
];

const trackingItems = [
  { title: 'Sleep Tracker', value: 'sleep', icon: Moon },
  { title: 'Wellness', value: 'wellness', icon: Heart },
];

const gameItems = [
  { title: 'Spin Wheel', value: 'spin-wheel', icon: Zap },
  { title: 'Trophies', value: 'trophies', icon: Trophy },
  { title: 'Power-ups', value: 'powerups', icon: Zap },
  { title: 'Avatar', value: 'avatar', icon: User },
  { title: 'Profile', value: 'profile', icon: User },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
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
