
import { useLocalStorage } from './useLocalStorage';
import { Task, UserProgress, XP_PER_LEVEL } from '../types/task';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [progress, setProgress] = useLocalStorage<UserProgress>('userProgress', {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
  });

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
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

    // Update progress
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
          newStreak = 1;
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

  const getTodaysTasks = () => {
    const today = new Date().toDateString();
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate).toDateString();
      return taskDate === today;
    });
  };

  const getTodayCompletionPercentage = () => {
    const todaysTasks = getTodaysTasks();
    if (todaysTasks.length === 0) return 0;
    const completedCount = todaysTasks.filter(task => task.completed).length;
    return Math.round((completedCount / todaysTasks.length) * 100);
  };

  return {
    tasks,
    progress,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    getTodaysTasks,
    getTodayCompletionPercentage,
  };
}
