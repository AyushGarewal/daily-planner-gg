import { useState, useEffect } from 'react';
import { Task, TaskType, Subtask } from '../types/task';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useXPMultiplier } from './useXPMultiplier';

interface Progress {
  totalXP: number;
  level: number;
  tasksCompleted: number;
  habitsCompleted: number;
  dailyCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
}

interface DailyUsage {
  autoComplete: boolean;
  skipToken: boolean;
  streakShield: boolean;
  spinUsed: boolean;
}

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [progress, setProgress] = useLocalStorage<Progress>('progress', {
    totalXP: 0,
    level: 1,
    tasksCompleted: 0,
    habitsCompleted: 0,
    dailyCompletionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [bonusXP, setBonusXP] = useLocalStorage<number>('bonusXP', 0);
  const [dailyUsage, setDailyUsage] = useLocalStorage<DailyUsage>('dailyUsage', {
    autoComplete: false,
    skipToken: false,
    streakShield: false,
    spinUsed: false,
  });
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  
  const { applyMultiplier } = useXPMultiplier();

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: uuidv4(),
      ...taskData,
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const completeTask = (id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          const xpReward = task.xpValue || 10;
          const isHabit = task.type === 'habit';
          
          // Update progress stats
          setProgress(p => ({
            ...p,
            totalXP: p.totalXP + xpReward,
            tasksCompleted: p.tasksCompleted + 1,
            habitsCompleted: isHabit ? p.habitsCompleted + 1 : p.habitsCompleted,
          }));
          
          return { ...task, completed: true, completedAt: new Date() };
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => {
      return prev.map(task => {
        if (task.id === taskId && task.subtasks) {
          const updatedSubtasks = task.subtasks.map(subtask => {
            if (subtask.id === subtaskId) {
              return { ...subtask, completed: !subtask.completed };
            }
            return subtask;
          });
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      });
    });
  };

  const canUseDaily = (type: keyof DailyUsage): boolean => {
    return !dailyUsage[type];
  };

  const markDailyUsed = (type: keyof DailyUsage) => {
    setDailyUsage(prev => ({ ...prev, [type]: true }));
  };

  useEffect(() => {
    // Reset daily usage at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      setDailyUsage({
        autoComplete: false,
        skipToken: false,
        streakShield: false,
        spinUsed: false,
      });
    }, timeUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  const getTodaysTasks = (): Task[] => {
    const today = new Date().toDateString();
    return tasks.filter(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toDateString();
        return dueDate === today;
      }
      return false;
    });
  };

  const getVisibleTodaysTasks = (): Task[] => {
    const todaysTasks = getTodaysTasks();
    const completedTasks = todaysTasks.filter(task => task.completed);
    
    if (progress.level >= 3 || completedTasks.length <= 3) {
      return todaysTasks;
    } else {
      return todaysTasks.slice(0, 3);
    }
  };

  const shouldShowSurplusTasks = (): boolean => {
    return progress.level >= 3;
  };

  const getTodayCompletionPercentage = (): number => {
    const todaysTasks = getTodaysTasks();
    const completedTasks = todaysTasks.filter(task => task.completed);
    const totalTasks = todaysTasks.length;
    
    return totalTasks === 0 ? 100 : Math.round((completedTasks.length / totalTasks) * 100);
  };

  const getTasksForDate = (date: Date): Task[] => {
    const dateString = date.toDateString();
    return tasks.filter(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toDateString();
        return dueDate === dateString;
      }
      return false;
    });
  };

  const filterTasks = (filters: { category?: string; priority?: string; completed?: boolean }): Task[] => {
    return tasks.filter(task => {
      if (filters.category && task.category !== filters.category) {
        return false;
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      if (filters.completed !== undefined && task.completed !== filters.completed) {
        return false;
      }
      return true;
    });
  };

  const sortTasks = (sortBy: 'dueDate' | 'xpValue' | 'priority'): Task[] => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'xpValue':
          return (b.xpValue || 0) - (a.xpValue || 0);
        case 'priority':
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
        default:
          return 0;
      }
    });
  };

  const addBonusXP = (amount: number) => {
    // Apply multiplier to bonus XP
    const multipliedAmount = applyMultiplier(amount);
    setBonusXP(prev => prev + multipliedAmount);
    
    // Update progress stats
    setProgress(prev => {
      const newTotalXP = prev.totalXP + multipliedAmount;
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      const leveledUp = newLevel > prev.level;
      
      if (leveledUp) {
        setShowLevelUp(newLevel);
      }
      
      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel
      };
    });
  };

  return {
    tasks,
    progress,
    bonusXP,
    dailyUsage,
    showLevelUp,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    toggleSubtask,
    addBonusXP,
    canUseDaily,
    markDailyUsed,
    setShowLevelUp,
    getTodaysTasks,
    getTodayCompletionPercentage,
    shouldShowSurplusTasks,
    getVisibleTodaysTasks,
    getTasksForDate,
    filterTasks,
    sortTasks
  };
}
