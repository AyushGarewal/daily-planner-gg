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
import { Calendar as CalendarIcon, Moon, Sun, Heart } from "lucide-react";
import { HabitPerformanceCalendar } from "@/components/HabitPerformanceCalendar";
import { WellnessCalendar } from "../components/WellnessCalendar";
import { SleepCalendar } from "../components/SleepCalendar";

const Index = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    {
      id: "tasks",
      title: "Tasks",
      icon: Sun,
      component: () => <></>,
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
      id: "goals",
      title: "Goals",
      icon: CalendarIcon,
      component: () => <></>,
      description: "Set and track your long term goals",
    },

    // Add calendar views to existing menu
    { 
      id: 'wellness-calendar', 
      title: 'Wellness Calendar', 
      icon: Heart, 
      component: WellnessCalendar,
      description: 'View mood, energy, and reflections over time'
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

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <span className="text-lg font-semibold">MyProduct</span>
          <ModeToggle />
        </div>
        <Separator />
        <nav className="py-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} className="px-4 py-2">
                <a
                  href="#"
                  className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-4">
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome to your productivity hub!
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6">
          {/* Main area for components */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>
                Select an option from the left sidebar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This is a{" "}
                <a
                  href="https://github.com/steven-tey/precedent"
                  target="_blank"
                >
                  Precedent
                </a>{" "}
                starter template.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
