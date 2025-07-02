
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Calendar as CalendarIcon, Moon, Sun, Heart, Circle, Shield, Droplets } from "lucide-react";
import { HabitPerformanceCalendar } from "@/components/HabitPerformanceCalendar";
import { WellnessCalendar } from "../components/WellnessCalendar";
import { SleepCalendar } from "../components/SleepCalendar";
import { SideHabits } from "../components/SideHabits";
import { NegativeHabits } from "../components/NegativeHabits";
import { WellnessLogging } from "../components/WellnessLogging";
import { LongTermGoals } from "../components/LongTermGoals";
import { MonthlyTasksView } from "../components/MonthlyTasksView";

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: Sun,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              Your productivity hub dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Select an option from the left sidebar to get started.</p>
          </CardContent>
        </Card>
      ),
      description: "Main dashboard overview",
    },
    {
      id: "tasks",
      title: "Tasks",
      icon: Sun,
      component: MonthlyTasksView,
      description: "Manage your daily, weekly and monthly tasks",
    },
    {
      id: "habits",
      title: "Habits",
      icon: Moon,
      component: () => <></>,
      description: "Track your habits and build consistency",
    },
    {
      id: "side-habits",
      title: "Side Habits",
      icon: Circle,
      component: SideHabits,
      description: "Track habits without affecting XP or streaks",
    },
    {
      id: "negative-habits",
      title: "Negative Habits",
      icon: Shield,
      component: NegativeHabits,
      description: "Resist bad habits and gain XP",
    },
    {
      id: "goals",
      title: "Goals",
      icon: CalendarIcon,
      component: LongTermGoals,
      description: "Set and track your long term goals",
    },
    {
      id: "wellness-logging",
      title: "Wellness Logging",
      icon: Droplets,
      component: WellnessLogging,
      description: "Track water and calorie intake",
    },
    { 
      id: 'wellness-calendar', 
      title: 'Wellness Calendar', 
      icon: Heart, 
      component: WellnessCalendar,
      description: 'View mood, energy, and wellness data over time'
    },
    { 
      id: 'sleep-calendar', 
      title: 'Sleep Calendar', 
      icon: Moon, 
      component: SleepCalendar,
      description: 'Track sleep patterns and quality'
    },
    { 
      id: 'habit-calendar', 
      title: 'Habit Calendar', 
      icon: CalendarIcon, 
      component: HabitPerformanceCalendar,
      description: 'View habit completion history'
    },
  ];

  const ActiveComponent = menuItems.find(item => item.id === activeView)?.component || (() => <div>Component not found</div>);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <span className="text-lg font-semibold">ProductivityHub</span>
          <ModeToggle />
        </div>
        <Separator />
        <nav className="py-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} className="px-4 py-2">
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center space-x-2 rounded-md p-2 w-full text-left transition-colors ${
                    activeView === item.id 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">
            {menuItems.find(item => item.id === activeView)?.title || 'Dashboard'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {menuItems.find(item => item.id === activeView)?.description || 'Welcome to your productivity hub!'}
          </p>
        </header>

        <section>
          <ActiveComponent />
        </section>
      </main>
    </div>
  );
};

export default Index;
