import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useXPSystem } from './useXPSystem';
import { useTasks } from './useTasks';

export type ChallengeType = 'streak' | 'frequency' | 'milestone' | 'avoidance' | 'completion' | 'combo';
export type HabitType = 'normal' | 'side' | 'negative';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challengeType: ChallengeType;
  linkedHabits: string[]; // habit IDs
  habitTypes: HabitType[]; // which types of habits are linked
  targetValue: number;
  currentProgress: number;
  timeLimit: number; // days
  xpReward: number;
  badgeReward?: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  isFailed: boolean;
  isActive: boolean;
  dailyProgress: { [date: string]: number };
  createdAt: Date;
  completedAt?: Date;
}

export interface ChallengeProgress {
  challengeId: string;
  progress: number;
  isCompleted: boolean;
  isFailed: boolean;
  lastUpdated: Date;
}

export function useChallengeSystem() {
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>('challenges', []);
  const { awardXP } = useXPSystem();
  const { tasks, progress: userProgress } = useTasks();
  const [sideHabits] = useLocalStorage('sideHabits', []);
  const [negativeHabits] = useLocalStorage('negativeHabits', []);

  // Create a new challenge
  const createChallenge = useCallback((challengeData: Omit<Challenge, 'id' | 'currentProgress' | 'isCompleted' | 'isFailed' | 'isActive' | 'dailyProgress' | 'createdAt'>) => {
    const newChallenge: Challenge = {
      ...challengeData,
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currentProgress: 0,
      isCompleted: false,
      isFailed: false,
      isActive: true,
      dailyProgress: {},
      createdAt: new Date(),
    };

    setChallenges(prev => [...prev, newChallenge]);
    return newChallenge.id;
  }, [setChallenges]);

  // Update challenge progress
  const updateChallengeProgress = useCallback((challengeId: string, progress: number, checkCompletion: boolean = true) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && challenge.isActive && !challenge.isCompleted && !challenge.isFailed) {
        const updatedChallenge = {
          ...challenge,
          currentProgress: Math.min(progress, challenge.targetValue),
          dailyProgress: {
            ...challenge.dailyProgress,
            [new Date().toDateString()]: progress
          }
        };

        // Check if challenge is completed
        if (checkCompletion && progress >= challenge.targetValue) {
          updatedChallenge.isCompleted = true;
          updatedChallenge.completedAt = new Date();
          updatedChallenge.isActive = false;
          
          // Award XP and badge
          if (challenge.xpReward > 0) {
            awardXP('challenge', challenge.id, challenge.xpReward, `Completed challenge: ${challenge.title}`);
          }
          
          console.log(`Challenge completed: ${challenge.title} - Awarded ${challenge.xpReward} XP`);
        }

        return updatedChallenge;
      }
      return challenge;
    }));
  }, [setChallenges, awardXP]);

  // Mark challenge as failed
  const failChallenge = useCallback((challengeId: string, reason?: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && challenge.isActive) {
        console.log(`Challenge failed: ${challenge.title}${reason ? ` - ${reason}` : ''}`);
        return {
          ...challenge,
          isFailed: true,
          isActive: false
        };
      }
      return challenge;
    }));
  }, [setChallenges]);

  // Retry a failed challenge
  const retryChallenge = useCallback((challengeId: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && challenge.isFailed) {
        const newStartDate = new Date();
        const newEndDate = new Date(Date.now() + challenge.timeLimit * 24 * 60 * 60 * 1000);
        return {
          ...challenge,
          isFailed: false,
          isCompleted: false,
          isActive: true,
          currentProgress: 0,
          dailyProgress: {},
          startDate: newStartDate,
          endDate: newEndDate
        };
      }
      return challenge;
    }));
  }, [setChallenges]);

  // Calculate streak for a habit
  const calculateHabitStreak = useCallback((habitId: string, habitType: HabitType): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) { // Check up to 365 days back
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = checkDate.toDateString();
      let isCompleted = false;

      if (habitType === 'normal') {
        // For normal habits, check if task is completed on the specific date
        const habitTask = tasks.find(t => 
          t.id === habitId && 
          t.type === 'habit' && 
          new Date(t.dueDate).toDateString() === dateString
        );
        isCompleted = habitTask?.completed || false;
      } else if (habitType === 'side') {
        const habit = sideHabits.find((h: any) => h.id === habitId);
        isCompleted = habit?.completedDates?.includes(dateString) || false;
      } else if (habitType === 'negative') {
        const habit = negativeHabits.find((h: any) => h.id === habitId);
        isCompleted = habit?.avoidedDates?.includes(dateString) || false;
      }

      if (isCompleted) {
        streak++;
      } else if (i > 0) { // Don't break streak on today if not completed yet
        break;
      }
    }

    return streak;
  }, [tasks, sideHabits, negativeHabits]);

  // Calculate frequency count for a habit in a time period
  const calculateHabitFrequency = useCallback((habitId: string, habitType: HabitType, startDate: Date | string, endDate: Date | string): number => {
    let count = 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (habitType === 'normal') {
      // For normal habits, count completed task instances in the date range
      const completedTasks = tasks.filter(t => {
        if (t.id !== habitId || t.type !== 'habit' || !t.completed) return false;
        const taskDate = new Date(t.dueDate).getTime();
        return taskDate >= start && taskDate <= end;
      });
      count = completedTasks.length;
    } else if (habitType === 'side') {
      const habit = sideHabits.find((h: any) => h.id === habitId);
      if (habit?.completedDates) {
        count = habit.completedDates.filter((dateStr: string) => {
          const date = new Date(dateStr).getTime();
          return date >= start && date <= end;
        }).length;
      }
    } else if (habitType === 'negative') {
      const habit = negativeHabits.find((h: any) => h.id === habitId);
      if (habit?.avoidedDates) {
        count = habit.avoidedDates.filter((dateStr: string) => {
          const date = new Date(dateStr).getTime();
          return date >= start && date <= end;
        }).length;
      }
    }

    return count;
  }, [tasks, sideHabits, negativeHabits]);

  // Calculate daily completion percentage
  const calculateDailyCompletionRate = useCallback((startDate: Date | string, endDate: Date | string): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const today = new Date().toDateString();
    
    // Get today's completion rate from user progress
    const todayTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === today);
    const completedToday = todayTasks.filter(t => t.completed).length;
    const totalToday = todayTasks.length;
    
    return totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
  }, [tasks]);

  // Check if combo habits were completed on the same day
  const checkComboCompletion = useCallback((habitIds: string[], habitTypes: HabitType[], checkDate: Date): boolean => {
    const dateString = checkDate.toDateString();
    
    return habitIds.every((habitId, index) => {
      const habitType = habitTypes[index];
      
      if (habitType === 'normal') {
        // Check if any habit task with this ID was completed on this date
        const habitTask = tasks.find(t => 
          t.id === habitId && 
          t.type === 'habit' && 
          new Date(t.dueDate).toDateString() === dateString
        );
        return habitTask?.completed || false;
      } else if (habitType === 'side') {
        const habit = sideHabits.find((h: any) => h.id === habitId);
        return habit?.completedDates?.includes(dateString) || false;
      } else if (habitType === 'negative') {
        const habit = negativeHabits.find((h: any) => h.id === habitId);
        return habit?.avoidedDates?.includes(dateString) || false;
      }
      
      return false;
    });
  }, [tasks, sideHabits, negativeHabits]);

  // Main challenge tracking logic
  const updateAllChallenges = useCallback(() => {
    console.log('Updating all challenges...');
    challenges.forEach(challenge => {
      if (!challenge.isActive || challenge.isCompleted || challenge.isFailed) return;

      console.log(`Checking challenge: ${challenge.title} - Type: ${challenge.challengeType} - Linked habits: ${challenge.linkedHabits.join(', ')}`);

      // Check if challenge has expired
      const endDate = new Date(challenge.endDate);
      if (challenge.endDate && new Date() > endDate) {
        if (challenge.currentProgress < challenge.targetValue) {
          console.log(`Challenge expired: ${challenge.title}`);
          failChallenge(challenge.id, 'Time limit exceeded');
        }
        return;
      }

      let newProgress = 0;
      let shouldFail = false;

      switch (challenge.challengeType) {
        case 'streak':
          // Find the minimum streak among linked habits
          if (challenge.linkedHabits.length > 0) {
            const streaks = challenge.linkedHabits.map((habitId, index) => {
              const streak = calculateHabitStreak(habitId, challenge.habitTypes[index]);
              const habitDetails = tasks.find(t => t.id === habitId);
              console.log(`Habit ${habitId} "${habitDetails?.title || 'Unknown'}" (${challenge.habitTypes[index]}) streak: ${streak}`);
              return streak;
            });
            newProgress = Math.min(...streaks);
            console.log(`Streak challenge ${challenge.title}: min streak = ${newProgress}`);
          }
          break;

        case 'frequency':
          // Sum up frequency counts for all linked habits
          if (challenge.linkedHabits.length > 0) {
            newProgress = challenge.linkedHabits.reduce((total, habitId, index) => {
              const freq = calculateHabitFrequency(habitId, challenge.habitTypes[index], challenge.startDate, challenge.endDate);
              const habitDetails = tasks.find(t => t.id === habitId);
              console.log(`Habit ${habitId} "${habitDetails?.title || 'Unknown'}" (${challenge.habitTypes[index]}) frequency: ${freq}`);
              return total + freq;
            }, 0);
            console.log(`Frequency challenge ${challenge.title}: total frequency = ${newProgress}`);
          }
          break;

        case 'milestone':
          // This would require numeric tracking - for now use frequency as proxy
          newProgress = challenge.linkedHabits.reduce((total, habitId, index) => 
            total + calculateHabitFrequency(habitId, challenge.habitTypes[index], challenge.startDate, challenge.endDate)
          , 0);
          break;

        case 'avoidance':
          // Check if any negative habit was failed
          if (challenge.linkedHabits.length > 0) {
            const today = new Date().toDateString();
            const anyFailed = challenge.linkedHabits.some((habitId, index) => {
              if (challenge.habitTypes[index] === 'negative') {
                const habit = negativeHabits.find((h: any) => h.id === habitId);
                return habit?.failedDates?.includes(today) || false;
              }
              return false;
            });
            
            if (anyFailed) {
              shouldFail = true;
            } else {
              // Count days successfully avoided
              const daysPassed = Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / (24 * 60 * 60 * 1000));
              newProgress = daysPassed;
            }
          }
          break;

        case 'completion':
          // Calculate average daily completion rate
          newProgress = calculateDailyCompletionRate(challenge.startDate, challenge.endDate);
          break;

        case 'combo':
          // Count days where all habits were completed together
          let comboDays = 0;
          const startDate = new Date(challenge.startDate);
          const daysPassed = Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000));
          
          for (let i = 0; i <= daysPassed; i++) {
            const checkDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            if (checkComboCompletion(challenge.linkedHabits, challenge.habitTypes, checkDate)) {
              comboDays++;
            }
          }
          newProgress = comboDays;
          break;
      }

      console.log(`Challenge ${challenge.title}: progress ${challenge.currentProgress} -> ${newProgress} (target: ${challenge.targetValue})`);

      if (shouldFail) {
        console.log(`Challenge ${challenge.title} failed!`);
        failChallenge(challenge.id, 'Avoidance challenge failed');
      } else if (newProgress !== challenge.currentProgress) {
        console.log(`Updating challenge ${challenge.title} progress from ${challenge.currentProgress} to ${newProgress}`);
        updateChallengeProgress(challenge.id, newProgress);
      }
    });
  }, [challenges, calculateHabitStreak, calculateHabitFrequency, calculateDailyCompletionRate, checkComboCompletion, negativeHabits, failChallenge, updateChallengeProgress]);

  // Update challenges when relevant data changes
  useEffect(() => {
    console.log('Challenge system triggered by data change');
    updateAllChallenges();
  }, [updateAllChallenges]);

  // Get active challenges
  const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted && !c.isFailed);
  const completedChallenges = challenges.filter(c => c.isCompleted);
  const failedChallenges = challenges.filter(c => c.isFailed);

  // Get available habits for linking (deduplicated)
  const getAvailableHabits = useCallback(() => {
    // Deduplicate normal habits by title, category, and recurrence
    const uniqueNormalHabits = tasks.filter(t => t.type === 'habit')
      .reduce((acc, task) => {
        const existing = acc.find(h => h.title === task.title && h.category === task.category && h.recurrence === task.recurrence);
        if (!existing) {
          acc.push(task);
        }
        return acc;
      }, [] as any[])
      .map(t => ({
        id: t.id,
        name: t.title,
        type: 'normal' as HabitType
      }));
    
    // Side habits are already unique by ID
    const sideHabitsList = sideHabits.map((h: any) => ({
      id: h.id,
      name: h.name,
      type: 'side' as HabitType
    }));
    
    // Negative habits are already unique by ID
    const negativeHabitsList = negativeHabits.map((h: any) => ({
      id: h.id,
      name: h.name,
      type: 'negative' as HabitType
    }));

    return [...uniqueNormalHabits, ...sideHabitsList, ...negativeHabitsList];
  }, [tasks, sideHabits, negativeHabits]);

  return {
    challenges,
    activeChallenges,
    completedChallenges,
    failedChallenges,
    createChallenge,
    updateChallengeProgress,
    failChallenge,
    retryChallenge,
    getAvailableHabits,
    updateAllChallenges
  };
}