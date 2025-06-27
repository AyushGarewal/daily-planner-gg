
import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  Calendar, 
  List, 
  Trophy, 
  Zap, 
  Heart, 
  User, 
  Gift, 
  Target,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'today', title: 'Today', icon: Target, description: 'Today\'s tasks' },
  { id: 'week', title: 'Week', icon: Calendar, description: 'Weekly view' },
  { id: 'all', title: 'All Tasks', icon: List, description: 'Complete task list' },
  { id: 'profile', title: 'Profile', icon: User, description: 'User stats & progress' },
  { id: 'avatar', title: 'Avatar', icon: Sparkles, description: 'Avatar & level system' },
  { id: 'trophies', title: 'Trophies', icon: Trophy, description: 'Earned achievements' },
  { id: 'custom-trophies', title: 'Custom Trophies', icon: Trophy, description: 'Create custom goals' },
  { id: 'powerups', title: 'Power-Ups', icon: Zap, description: 'Use power-ups' },
  { id: 'wellness', title: 'Wellness', icon: Heart, description: 'Mood & insights' },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-6">
            Task Planner
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
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
