import React from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, UserProgress, XP_PER_LEVEL } from '../types/task';
import { useAchievements } from './useAchievements';
import { addDays, isBefore, startOfDay } from 'date-fns';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [progress, setProgress] = useLocalStorage<UserProgress>('userProgress', {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
  });
  const [bonusXP, setBonusXP] = useLocalStorage<number>('bonusXP', 0);

  const { userStats, useStreakShield } = useAchievements();

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
    
    // Auto-generate recurring tasks
    generateRecurringTasks(newTask);
  };

  const generateRecurringTasks = (baseTask: Task) => {
    if (baseTask.recurrence === 'None') return;
    
    const today = startOfDay(new Date());
    const taskDate = startOfDay(new Date(baseTask.dueDate));
    
    // Only generate future recurring tasks
    if (!isBefore(taskDate, today) && baseTask.recurrence === 'Daily') {
      const futureTasks: Task[] = [];
      
      // Generate next 30 days of recurring tasks
      for (let i = 1; i <= 30; i++) {
        const futureDate = addDays(taskDate, i);
        futureTasks.push({
          ...baseTask,
          id: crypto.randomUUID(),
          dueDate: futureDate,
          completed: false,
          completedAt: undefined,
        });
      }
      
      setTasks(prev => [...prev, ...futureTasks]);
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const completeTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    const completedAt = new Date();
    updateTask(id, { completed: true, completedAt });

    // Update progress with streak shield logic
    setProgress(prev => {
      const newTotalXP = prev.totalXP + task.xpValue;
      const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1;
      
      // Update streak
      const today = new Date().toDateString();
      const lastCompletionDate = prev.lastCompletionDate ? new Date(prev.lastCompletionDate).toDateString() : null;
      
      let newStreak = prev.currentStreak;
      if (!lastCompletionDate || lastCompletionDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastCompletionDate === yesterday.toDateString()) {
          newStreak = prev.currentStreak + 1;
        } else if (lastCompletionDate === today) {
          newStreak = prev.currentStreak;
        } else {
          // Streak would break - check for streak shield
          if (useStreakShield()) {
            newStreak = prev.currentStreak; // Keep streak with shield
          } else {
            newStreak = 1;
          }
        }
      }

      return {
        totalXP: newTotalXP,
        level: newLevel,
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        lastCompletionDate: completedAt,
      };
    });
  };

  const addBonusXP = (amount: number) => {
    setProgress(prev => {
      const newTotalXP = prev.totalXP + amount;
      const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1;
      
      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
      };
    });
    setBonusXP(0); // Clear bonus XP after using
  };

  const markMissedHabits = () => {
    const today = startOfDay(new Date());
    const yesterday = addDays(today, -1);
    
    setTasks(prev => prev.map(task => {
      const taskDate = startOfDay(new Date(task.dueDate));
      
      // Mark incomplete recurring tasks from yesterday as failed
      if (
        task.recurrence === 'Daily' && 
        taskDate.getTime() === yesterday.getTime() && 
        !task.completed
      ) {
        return { ...task, completed: false, failed: true };
      }
      return task;
    }));
  };

  const getTodaysTasks = () => {
    const today = new Date().toDateString();
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate).toDateString();
      return taskDate === today;
    });
  };

  const getTodaysNormalTasks = () => {
    return getTodaysTasks().filter(task => task.taskType === 'normal');
  };

  const getTodaysSurplusTasks = () => {
    return getTodaysTasks().filter(task => task.taskType === 'surplus');
  };

  const getTodayCompletionPercentage = () => {
    const todaysTasks = getTodaysNormalTasks();
    if (todaysTasks.length === 0) return 0;
    const completedCount = todaysTasks.filter(task => task.completed).length;
    return Math.round((completedCount / todaysTasks.length) * 100);
  };

  const shouldShowSurplusTasks = () => {
    return getTodayCompletionPercentage() >= 80;
  };

  const getVisibleTodaysTasks = () => {
    const normalTasks = getTodaysNormalTasks();
    const surplusTasks = getTodaysSurplusTasks();
    
    if (shouldShowSurplusTasks()) {
      return [...normalTasks, ...surplusTasks];
    }
    return normalTasks;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return tasks.filter(task => new Date(task.dueDate).toDateString() === dateStr);
  };

  const filterTasks = (filters: { category?: string; priority?: string; completed?: boolean }) => {
    return tasks.filter(task => {
      if (filters.category && task.category !== filters.category) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.completed !== undefined && task.completed !== filters.completed) return false;
      return true;
    });
  };

  const sortTasks = (sortBy: 'dueDate' | 'xpValue' | 'priority') => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'xpValue':
          return b.xpValue - a.xpValue;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });
  };

  // Auto-mark missed habits on component mount
  React.useEffect(() => {
    markMissedHabits();
  }, []);

  return {
    tasks,
    progress,
    bonusXP,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    addBonusXP,
    getTodaysTasks,
    getTodaysNormalTasks: () => getTodaysTasks().filter(task => task.taskType === 'normal'),
    getTodaysSurplusTasks: () => getTodaysTasks().filter(task => task.taskType === 'surplus'),
    getTodayCompletionPercentage: () => {
      const todaysTasks = getTodaysTasks().filter(task => task.taskType === 'normal');
      if (todaysTasks.length === 0) return 0;
      const completedCount = todaysTasks.filter(task => task.completed).length;
      return Math.round((completedCount / todaysTasks.length) * 100);
    },
    shouldShowSurplusTasks: () => {
      const todaysTasks = getTodaysTasks().filter(task => task.taskType === 'normal');
      if (todaysTasks.length === 0) return false;
      const completedCount = todaysTasks.filter(task => task.completed).length;
      return Math.round((completedCount / todaysTasks.length) * 100) >= 80;
    },
    getVisibleTodaysTasks: () => {
      const normalTasks = getTodaysTasks().filter(task => task.taskType === 'normal');
      const surplusTasks = getTodaysTasks().filter(task => task.taskType === 'surplus');
      
      const todaysTasks = getTodaysTasks().filter(task => task.taskType === 'normal');
      const completedCount = todaysTasks.filter(task => task.completed).length;
      const completionPercentage = todaysTasks.length === 0 ? 0 : Math.round((completedCount / todaysTasks.length) * 100);
      
      if (completionPercentage >= 80) {
        return [...normalTasks, ...surplusTasks];
      }
      return normalTasks;
    },
    getTasksForDate: (date: Date) => {
      const dateStr = date.toDateString();
      return tasks.filter(task => new Date(task.dueDate).toDateString() === dateStr);
    },
    filterTasks: (filters: { category?: string; priority?: string; completed?: boolean }) => {
      return tasks.filter(task => {
        if (filters.category && task.category !== filters.category) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.completed !== undefined && task.completed !== filters.completed) return false;
        return true;
      });
    },
    sortTasks: (sortBy: 'dueDate' | 'xpValue' | 'priority') => {
      return [...tasks].sort((a, b) => {
        switch (sortBy) {
          case 'dueDate':
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'xpValue':
            return b.xpValue - a.xpValue;
          case 'priority':
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          default:
            return 0;
        }
      });
    },
  };
}
