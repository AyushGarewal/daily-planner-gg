
import { useState, useEffect } from 'react';
import { Task, TaskType, Subtask } from '../types/task';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useXPMultiplier } from './useXPMultiplier';
import { addXPTransaction } from '../components/XPBar';
import { useHabitRecurrence } from './useHabitRecurrence';

interface Progress {
  totalXP: number;
  level: number;
  tasksCompleted: number;
  habitsCompleted: number;
  dailyCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  maxStreak: number;
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
    maxStreak: 0,
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
  const { checkAndGenerateRecurringHabits, updateFutureHabitInstances, deleteRecurringInstances } = useHabitRecurrence();

  // Generate recurring habits when tasks change or on app load
  useEffect(() => {
    const tasksWithRecurring = checkAndGenerateRecurringHabits(tasks);
    if (tasksWithRecurring.length !== tasks.length) {
      console.log(`Adding ${tasksWithRecurring.length - tasks.length} new recurring habit instances`);
      setTasks(tasksWithRecurring);
    }
  }, []);

  // Generate recurring habits daily at midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      console.log('Generating recurring habits for new day');
      setTasks(prev => checkAndGenerateRecurringHabits(prev));
      
      // Reset daily usage
      setDailyUsage({
        autoComplete: false,
        skipToken: false,
        streakShield: false,
        spinUsed: false,
      });
    }, timeUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  // Listen for undo events
  useEffect(() => {
    const handleXPUndo = (event: CustomEvent) => {
      const { type, itemId, xpChange } = event.detail;
      
      if (type === 'task' || type === 'habit') {
        // Find and update the task/habit
        setTasks(prev => prev.map(task => {
          if (task.id === itemId) {
            return { ...task, completed: false, completedAt: undefined };
          }
          return task;
        }));
        
        // Reverse XP and progress changes
        setProgress(prev => ({
          ...prev,
          totalXP: Math.max(0, prev.totalXP - xpChange),
          level: Math.floor(Math.max(0, prev.totalXP - xpChange) / 100) + 1,
          tasksCompleted: Math.max(0, prev.tasksCompleted - 1),
          habitsCompleted: type === 'habit' ? Math.max(0, prev.habitsCompleted - 1) : prev.habitsCompleted,
          currentStreak: Math.max(0, prev.currentStreak - 1)
        }));
      }
    };

    window.addEventListener('xp-undo', handleXPUndo as EventListener);
    return () => window.removeEventListener('xp-undo', handleXPUndo as EventListener);
  }, [setTasks, setProgress]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: uuidv4(),
      ...taskData,
      completed: false,
    };
    
    console.log('Adding new task/habit:', newTask);
    
    setTasks(prev => {
      const updatedTasks = [...prev, newTask];
      
      // If it's a recurring habit, generate recurring instances
      if (newTask.type === 'habit' && newTask.recurrence !== 'None') {
        console.log('Generating recurring instances for new habit');
        return checkAndGenerateRecurringHabits(updatedTasks);
      }
      
      return updatedTasks;
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    console.log(`Updating task ${id}:`, updates);
    
    setTasks(prev => {
      // First, update the specific task
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          return { ...task, ...updates };
        }
        return task;
      });
      
      // Check if we updated a base habit that needs future sync
      const updatedTask = updatedTasks.find(task => task.id === id);
      if (updatedTask && updatedTask.type === 'habit' && !updatedTask.isRecurringInstance) {
        console.log('Updating base habit, will sync future instances');
        
        // If recurrence changed, we need to delete old instances and generate new ones
        const originalTask = prev.find(task => task.id === id);
        if (originalTask && originalTask.recurrence !== updatedTask.recurrence) {
          console.log('Recurrence changed, regenerating instances');
          
          // Delete existing future instances
          const tasksWithoutOldInstances = deleteRecurringInstances(updatedTask.id, updatedTasks);
          
          // Generate new instances based on new recurrence
          return checkAndGenerateRecurringHabits(tasksWithoutOldInstances);
        }
        
        return updateFutureHabitInstances(updatedTask, updatedTasks);
      }
      
      return updatedTasks;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => {
      const taskToDelete = prev.find(task => task.id === id);
      
      if (taskToDelete?.type === 'habit' && !taskToDelete.isRecurringInstance) {
        // If deleting a base habit, also delete all its recurring instances
        console.log('Deleting base habit and all its recurring instances');
        return prev.filter(task => 
          task.id !== id && 
          task.parentHabitId !== id
        );
      }
      
      // For other tasks or recurring instances, just delete the specific task
      return prev.filter(task => task.id !== id);
    });
  };

  const completeTask = (id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          // Toggle completion state
          const newCompleted = !task.completed;
          const isHabit = task.type === 'habit';
          const isRoutine = task.isRoutine;
          let xpReward = task.xpValue || 10;
          let shouldCountForStreak = true;
          
          console.log(`${newCompleted ? 'Completing' : 'Uncompleting'} task: ${task.title}`);
          console.log(`Is routine: ${isRoutine}, Base XP: ${xpReward}`);
          
          // Calculate XP and streak based on subtask completion
          if (task.subtasks && task.subtasks.length > 0) {
            const completedSubtasks = task.subtasks.filter(st => st.completed).length;
            const totalSubtasks = task.subtasks.length;
            const completionPercentage = completedSubtasks / totalSubtasks;
            
            console.log(`Task: ${task.title}, Subtasks: ${completedSubtasks}/${totalSubtasks} (${Math.round(completionPercentage * 100)}%)`);
            
            // Award proportional XP based on completion percentage
            xpReward = Math.round((task.xpValue || 10) * completionPercentage);
            
            // Only count for streak if ALL subtasks are completed (100%)
            shouldCountForStreak = completionPercentage === 1;
            
            console.log(`XP awarded: ${xpReward}, Counts for streak: ${shouldCountForStreak}`);
          }
          
          // Apply XP multiplier
          const finalXP = applyMultiplier(xpReward);
          
          if (newCompleted) {
            // Add XP transaction for undo functionality
            addXPTransaction(
              isHabit ? 'habit' : 'task',
              task.id,
              task.title,
              finalXP
            );
            
            console.log(`Final XP for ${task.title}: ${finalXP}, Is Routine: ${isRoutine}, Should count for streak: ${shouldCountForStreak}`);
            
            // Update progress stats - ALWAYS count routine tasks for XP and completion
            setProgress(p => {
              const newProgress = {
                ...p,
                totalXP: p.totalXP + finalXP,
                tasksCompleted: p.tasksCompleted + 1,
                habitsCompleted: isHabit ? p.habitsCompleted + 1 : p.habitsCompleted,
              };
              
              // Only update streak if task qualifies for streak counting
              if (shouldCountForStreak) {
                newProgress.currentStreak = p.currentStreak + 1;
                newProgress.longestStreak = (p.currentStreak + 1) > p.longestStreak 
                  ? p.currentStreak + 1 
                  : p.longestStreak;
                newProgress.maxStreak = (p.currentStreak + 1) > p.maxStreak 
                  ? p.currentStreak + 1 
                  : p.maxStreak;
              }
              
              console.log(`Progress updated:`, newProgress);
              return newProgress;
            });
          } else {
            // Uncompleting - reverse the XP and progress
            console.log(`Reversing XP for ${task.title}: -${finalXP}`);
            
            setProgress(p => ({
              ...p,
              totalXP: Math.max(0, p.totalXP - finalXP),
              tasksCompleted: Math.max(0, p.tasksCompleted - 1),
              habitsCompleted: isHabit ? Math.max(0, p.habitsCompleted - 1) : p.habitsCompleted,
              currentStreak: shouldCountForStreak ? Math.max(0, p.currentStreak - 1) : p.currentStreak,
              longestStreak: p.longestStreak, // Don't reduce longest streak
              maxStreak: p.maxStreak // Don't reduce max streak
            }));
          }
          
          return { 
            ...task, 
            completed: newCompleted, 
            completedAt: newCompleted ? new Date() : undefined 
          };
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
              const newCompleted = !subtask.completed;
              console.log(`Toggling subtask: ${subtask.title} to ${newCompleted}`);
              return { ...subtask, completed: newCompleted };
            }
            return subtask;
          });
          
          const completedCount = updatedSubtasks.filter(st => st.completed).length;
          console.log(`Task ${task.title} now has ${completedCount}/${updatedSubtasks.length} subtasks completed`);
          
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

  const getUserHabits = (): Task[] => {
    // Get base habits (not recurring instances) and remove duplicates
    const baseHabits = tasks.filter(task => 
      task.type === 'habit' && !task.isRecurringInstance
    );
    
    // Remove duplicates by creating a Map with unique titles
    const uniqueHabits = new Map();
    
    baseHabits.forEach(habit => {
      if (!uniqueHabits.has(habit.title) || !uniqueHabits.get(habit.title).completed) {
        uniqueHabits.set(habit.title, habit);
      }
    });
    
    return Array.from(uniqueHabits.values());
  };

  // Calculate today's completion percentage including partial subtask completion
  const getTodayCompletionPercentage = (): number => {
    const todaysTasks = getTodaysTasks();
    
    if (todaysTasks.length === 0) return 100;
    
    let totalProgress = 0;
    
    todaysTasks.forEach(task => {
      if (task.completed) {
        totalProgress += 1;
      } else if (task.subtasks && task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        const subtaskProgress = completedSubtasks / task.subtasks.length;
        totalProgress += subtaskProgress;
        console.log(`Task ${task.title}: ${completedSubtasks}/${task.subtasks.length} subtasks = ${Math.round(subtaskProgress * 100)}% progress`);
      }
    });
    
    const finalPercentage = Math.round((totalProgress / todaysTasks.length) * 100);
    console.log(`Total completion: ${totalProgress}/${todaysTasks.length} = ${finalPercentage}%`);
    return finalPercentage;
  };

  const getTodaysTasks = (): Task[] => {
    const today = new Date().toDateString();
    
    // Filter out routine tasks from the main task list
    return tasks.filter(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toDateString();
        return dueDate === today && !task.isRoutine; // Exclude routine tasks
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
          const priorityOrder = { High: 1, Medium: 2, Low: 3 };
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
    
    // Add XP transaction
    addXPTransaction('bonus', 'bonus', 'Bonus XP', multipliedAmount);
    
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
    setProgress, // Expose setProgress function
    getTodaysTasks,
    getTodayCompletionPercentage,
    shouldShowSurplusTasks,
    getVisibleTodaysTasks,
    getTasksForDate,
    filterTasks,
    sortTasks,
    getUserHabits
  };
}
