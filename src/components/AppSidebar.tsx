
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
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'today', title: 'Today', icon: Target, description: 'Today\'s tasks', category: 'Tasks' },
  { id: 'week', title: 'Week', icon: Calendar, description: 'Weekly view', category: 'Tasks' },
  { id: 'all', title: 'All Tasks', icon: List, description: 'Complete task list', category: 'Tasks' },
  { id: 'long-term-goals', title: 'Long-Term Goals', icon: TrendingUp, description: 'Track your big aspirations', category: 'Goals' },
  { id: 'spin-wheel', title: 'Daily Spin', icon: Gift, description: 'Spin for rewards', category: 'Rewards' },
  { id: 'profile', title: 'Profile', icon: User, description: 'User stats & progress', category: 'Profile' },
  { id: 'avatar', title: 'Avatar', icon: Sparkles, description: 'Avatar & level system', category: 'Profile' },
  { id: 'trophies', title: 'Trophies', icon: Trophy, description: 'Earned achievements', category: 'Rewards' },
  { id: 'custom-trophies', title: 'Custom Goals', icon: Trophy, description: 'Create custom goals', category: 'Rewards' },
  { id: 'powerups', title: 'Inventory', icon: Zap, description: 'Use items & rewards', category: 'Rewards' },
  { id: 'wellness', title: 'Wellness', icon: Heart, description: 'Mood & insights', category: 'Wellness' },
];

const categories = [
  { name: 'Tasks', items: navigationItems.filter(item => item.category === 'Tasks') },
  { name: 'Goals', items: navigationItems.filter(item => item.category === 'Goals') },
  { name: 'Rewards', items: navigationItems.filter(item => item.category === 'Rewards') },
  { name: 'Profile', items: navigationItems.filter(item => item.category === 'Profile') },
  { name: 'Wellness', items: navigationItems.filter(item => item.category === 'Wellness') },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-6">
            Task Planner
          </SidebarGroupLabel>
        </SidebarGroup>
        
        {categories.map((category) => (
          <SidebarGroup key={category.name}>
            <SidebarGroupLabel className="px-4 py-2 text-sm font-semibold text-muted-foreground">
              {category.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-start min-h-[48px] px-4 hover:bg-accent transition-colors"
                    >
                      <item.icon className="h-4 w-4 mr-3 shrink-0" />
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-medium truncate">{item.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                      </div>
                      {item.id === 'spin-wheel' && (
                        <span className="ml-auto text-lg animate-spin-slow">🎯</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
