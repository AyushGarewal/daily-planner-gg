
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
  useSidebar
} from '@/components/ui/sidebar';
import { 
  Calendar, 
  List, 
  BarChart3, 
  Heart, 
  Trophy, 
  Zap, 
  Gift, 
  User, 
  Target,
  CalendarDays
} from 'lucide-react';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mainItems = [
  { id: 'today', title: 'Today', icon: Calendar },
  { id: 'week', title: 'This Week', icon: CalendarDays },
  { id: 'monthly', title: 'Monthly View', icon: Calendar },
  { id: 'all', title: 'All Tasks', icon: List },
];

const featuresItems = [
  { id: 'long-term-goals', title: 'Long-term Goals', icon: Target },
  { id: 'challenges', title: 'Custom Challenges', icon: Target },
  { id: 'spin-wheel', title: 'Daily Spin', icon: Gift },
  { id: 'wellness', title: 'Wellness', icon: Heart },
];

const gamificationItems = [
  { id: 'trophies', title: 'Trophies', icon: Trophy },
  { id: 'powerups', title: 'Power-ups', icon: Zap },
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'avatar', title: 'Avatar', icon: User },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton 
            onClick={() => onTabChange(item.id)}
            isActive={activeTab === item.id}
            className={activeTab === item.id ? 'bg-primary text-primary-foreground' : ''}
          >
            <item.icon className="h-4 w-4" />
            {!isCollapsed && <span>{item.title}</span>}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(featuresItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gamification</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(gamificationItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
