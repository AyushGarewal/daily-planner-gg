
import React from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, UserProgress, getCurrentLevel, getXPRequiredForLevel, DailyUsage } from '../types/task';
import { useAchievements } from './useAchievements';
import { addDays, isBefore, startOfDay, isSameDay, getDay, isAfter } from 'date-fns';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [progress, setProgress] = useLocalStorage<UserProgress>('userProgress', {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
  });
  const [bonusXP, setBonusXP] = useLocalStorage<number>('bonusXP', 0);
  const [dailyUsage, setDailyUsage] = useLocalStorage<DailyUsage[]>('dailyUsage', []);
  const [showLevelUp, setShowLevelUp] = useLocalStorage<number | null>('showLevelUp', null);

  const { userStats, useStreakShield } = useAchievements();

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
    
    // Auto-generate recurring tasks for habits
    if (task.type === 'habit' && !task.isRoutine) {
      generateRecurringTasks(newTask);
    }
  };

  const generateRecurringTasks = (baseTask: Task) => {
    if (baseTask.recurrence === 'None' || baseTask.type !== 'habit') return;
    
    const today = startOfDay(new Date());
    const taskDate = startOfDay(new Date(baseTask.dueDate));
    
    // For daily recurring habits, generate future tasks starting from creation date
    if (baseTask.recurrence === 'Daily') {
      const futureTasks: Task[] = [];
      
      // Generate next 30 days of recurring tasks starting from tomorrow
      for (let i = 1; i <= 30; i++) {
        const futureDate = addDays(taskDate, i);
        futureTasks.push({
          ...baseTask,
          id: crypto.randomUUID(),
          dueDate: futureDate,
          completed: false,
          completedAt: undefined,
          isRoutine: baseTask.isRoutine || false,
        });
      }
      
      setTasks(prev => [...prev, ...futureTasks]);
    }
    
    // For weekly recurring habits with specific weekdays
    if (baseTask.recurrence === 'Weekly' && baseTask.weekDays) {
      const futureTasks: Task[] = [];
      
      // Generate next 4 weeks starting from creation date
      for (let week = 0; week < 4; week++) {
        baseTask.weekDays.forEach(weekDay => {
          for (let day = 1; day <= 7; day++) {
            const futureDate = addDays(taskDate, (week * 7) + day);
            if (getDay(futureDate) === weekDay && !isSameDay(futureDate, taskDate)) {
              futureTasks.push({
                ...baseTask,
                id: crypto.randomUUID(),
                dueDate: futureDate,
                completed: false,
                completedAt: undefined,
                isRoutine: baseTask.isRoutine || false,
              });
            }
          }
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

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      
      const updatedSubtasks = task.subtasks.map(subtask =>
        subtask.id === subtaskId 
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      );
      
      // Check if all subtasks are completed
      const allSubtasksCompleted = updatedSubtasks.length > 0 && 
        updatedSubtasks.every(st => st.completed);
      
      // Auto-complete main task if all subtasks are done
      if (allSubtasksCompleted && !task.completed) {
        completeTask(taskId);
      }
      
      return { ...task, subtasks: updatedSubtasks };
    }));
  };

  const updateLinkedGoalsProgress = (task: Task) => {
    if (!task.goalId) return;
    
    try {
      const goals = JSON.parse(localStorage.getItem('goals') || '[]');
      const updatedGoals = goals.map((goal: any) => {
        if (goal.id === task.goalId && goal.hasNumericTarget) {
          const newProgress = (goal.currentProgress || 0) + 1;
          const isCompleted = newProgress >= goal.numericTarget;
          
          return {
            ...goal,
            currentProgress: Math.min(newProgress, goal.numericTarget),
            isCompleted,
            updatedAt: new Date()
          };
        }
        return goal;
      });
      
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      console.log('Updated goal progress for task completion:', task.title);
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const completeTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    // Check if all subtasks are completed (if any exist)
    if (task.subtasks.length > 0) {
      const allSubtasksCompleted = task.subtasks.every(st => st.completed);
      if (!allSubtasksCompleted) return; // Don't complete if subtasks remain
    }

    const completedAt = new Date();
    updateTask(id, { completed: true, completedAt });

    // Update linked goals progress
    updateLinkedGoalsProgress(task);

    // Update progress with new level system
    setProgress(prev => {
      const newTotalXP = prev.totalXP + task.xpValue;
      const oldLevel = getCurrentLevel(prev.totalXP);
      const newLevel = getCurrentLevel(newTotalXP);
      
      // Show level up animation if leveled up
      if (newLevel > oldLevel) {
        setShowLevelUp(newLevel);
      }
      
      // Update streak for habits only
      const today = new Date().toDateString();
      const lastCompletionDate = prev.lastCompletionDate ? new Date(prev.lastCompletionDate).toDateString() : null;
      
      let newStreak = prev.currentStreak;
      if (task.type === 'habit' && (!lastCompletionDate || lastCompletionDate !== today)) {
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
      const oldLevel = getCurrentLevel(prev.totalXP);
      const newLevel = getCurrentLevel(newTotalXP);
      
      // Show level up animation if leveled up
      if (newLevel > oldLevel) {
        setShowLevelUp(newLevel);
      }
      
      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
      };
    });
    setBonusXP(0); // Clear bonus XP after using
  };

  const canUseDaily = (type: keyof DailyUsage): boolean => {
    const today = new Date().toDateString();
    const todayUsage = dailyUsage.find(usage => usage.date === today);
    return !todayUsage?.[type];
  };

  const markDailyUsed = (type: keyof DailyUsage) => {
    const today = new Date().toDateString();
    setDailyUsage(prev => {
      const existing = prev.find(usage => usage.date === today);
      if (existing) {
        return prev.map(usage => 
          usage.date === today 
            ? { ...usage, [type]: true }
            : usage
        );
      } else {
        return [...prev, {
          date: today,
          streakShield: type === 'streakShield',
          autoComplete: type === 'autoComplete',
          skipToken: type === 'skipToken',
          spinUsed: type === 'spinUsed'
        }];
      }
    });
  };

  const getTodaysTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      
      // For weekly habits, check if today matches one of the selected weekdays
      if (task.type === 'habit' && task.recurrence === 'Weekly' && task.weekDays) {
        const todayWeekday = getDay(today);
        return task.weekDays.includes(todayWeekday) && 
               isSameDay(taskDate, today);
      }
      
      return isSameDay(taskDate, today);
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

  const getUserHabits = () => {
    // Get unique habits (remove duplicates from recurring generation)
    const uniqueHabits = tasks.filter(task => task.type === 'habit')
      .reduce((acc, task) => {
        const existingHabit = acc.find(h => h.title === task.title && h.category === task.category);
        if (!existingHabit) {
          acc.push(task);
        }
        return acc;
      }, [] as Task[]);
    
    return uniqueHabits;
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
    getTodaysNormalTasks,
    getTodaysSurplusTasks,
    getTodayCompletionPercentage,
    shouldShowSurplusTasks,
    getVisibleTodaysTasks,
    getUserHabits,
    getTasksForDate: (date: Date) => {
      return tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        
        // For weekly habits, check if the date matches one of the selected weekdays
        if (task.type === 'habit' && task.recurrence === 'Weekly' && task.weekDays) {
          const dateWeekday = getDay(date);
          return task.weekDays.includes(dateWeekday) && 
                 isSameDay(taskDate, date);
        }
        
        return isSameDay(taskDate, date);
      });
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
