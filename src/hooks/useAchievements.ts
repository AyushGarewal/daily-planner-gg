

import { useLocalStorage } from './useLocalStorage';
import { Achievement, PowerUp, UserStats, DailyUsage } from '../types/achievements';
import { ACHIEVEMENTS } from '../data/achievements';
import { UserProgress } from '../types/task';

export function useAchievements() {
  const [userStats, setUserStats] = useLocalStorage<UserStats>('userStats', {
    achievements: ACHIEVEMENTS.map(a => ({ ...a })),
    powerUps: [],
    streakShields: 0,
    tasksCompleted: 0,
    totalTasksCompleted: 0,
    earlyBirdCount: 0,
    theme: 'light',
    dailyUsage: [],
    unlockedThemes: ['light'],
    motivationQuotes: [],
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
    habitsCompleted: 0,
    achievementsUnlocked: 0,
    streakShieldsUsed: 0,
    powerUpsUsed: 0,
    dailyCompletionRate: 0,
  });

  const checkAchievements = (progress: UserProgress, tasks: any[]) => {
    const now = new Date();
    const completedTasks = tasks.filter(t => t.completed);
    
    // Count early bird tasks (completed before 9 AM)
    const earlyBirdTasks = completedTasks.filter(task => {
      if (task.completedAt) {
        const completedTime = new Date(task.completedAt);
        return completedTime.getHours() < 9;
      }
      return false;
    });

    // Check for early completions (tasks completed a day before due date)
    const hasEarlyCompletion = completedTasks.some(task => {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const dueDate = new Date(task.dueDate);
        const dayDiff = Math.ceil((dueDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
        return dayDiff >= 1;
      }
      return false;
    });

    const checkData = {
      currentStreak: progress.currentStreak,
      level: progress.level,
      totalTasksCompleted: completedTasks.length,
      earlyBirdCount: earlyBirdTasks.length,
      hasEarlyCompletion,
    };

    // Ensure achievements have condition functions by merging with fresh ACHIEVEMENTS data
    const newAchievements = userStats.achievements.map((userAchievement, index) => {
      const freshAchievement = ACHIEVEMENTS[index];
      const mergedAchievement = {
        ...freshAchievement,
        unlocked: userAchievement.unlocked,
        unlockedAt: userAchievement.unlockedAt
      };

      if (!mergedAchievement.unlocked && mergedAchievement.condition && mergedAchievement.condition(checkData)) {
        return { ...mergedAchievement, unlocked: true, unlockedAt: now };
      }
      return mergedAchievement;
    });

    setUserStats(prev => ({
      ...prev,
      achievements: newAchievements,
      totalTasksCompleted: completedTasks.length,
      tasksCompleted: completedTasks.length,
      earlyBirdCount: earlyBirdTasks.length,
    }));

    // Return newly unlocked achievements
    const newlyUnlocked = newAchievements.filter((ach, index) => 
      ach.unlocked && !userStats.achievements[index].unlocked
    );
    
    return newlyUnlocked;
  };

  const addPowerUp = (powerUp: PowerUp) => {
    setUserStats(prev => {
      const existingPowerUp = prev.powerUps.find(p => p.id === powerUp.id);
      if (existingPowerUp) {
        return {
          ...prev,
          powerUps: prev.powerUps.map(p => 
            p.id === powerUp.id 
              ? { ...p, uses: Math.min(p.uses + powerUp.uses, p.maxUses || 10) }
              : p
          )
        };
      }
      return { ...prev, powerUps: [...prev.powerUps, powerUp] };
    });
  };

  const usePowerUp = (powerUpId: string) => {
    setUserStats(prev => ({
      ...prev,
      powerUps: prev.powerUps.map(p => 
        p.id === powerUpId && p.uses > 0 
          ? { ...p, uses: p.uses - 1 }
          : p
      ).filter(p => p.uses > 0)
    }));
  };

  const addStreakShield = (count: number = 1) => {
    setUserStats(prev => ({
      ...prev,
      streakShields: prev.streakShields + count
    }));
  };

  const useStreakShield = () => {
    if (userStats.streakShields > 0) {
      setUserStats(prev => ({
        ...prev,
        streakShields: prev.streakShields - 1
      }));
      return true;
    }
    return false;
  };

  const canSpin = () => {
    const today = new Date().toDateString();
    const lastSpin = userStats.lastSpinDate ? new Date(userStats.lastSpinDate).toDateString() : null;
    return lastSpin !== today;
  };

  const recordSpin = () => {
    setUserStats(prev => ({
      ...prev,
      lastSpinDate: new Date()
    }));
  };

  const setTheme = (theme: string) => {
    setUserStats(prev => ({ ...prev, theme }));
  };

  return {
    userStats,
    checkAchievements,
    addPowerUp,
    usePowerUp,
    addStreakShield,
    useStreakShield,
    canSpin,
    recordSpin,
    setTheme,
  };
}

