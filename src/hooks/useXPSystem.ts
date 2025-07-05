
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, UserProgress } from '../types/task';
import { SideHabit, NegativeHabit } from '../types/sideHabits';
import { useXPMultiplier } from './useXPMultiplier';

interface XPTransaction {
  id: string;
  type: 'task' | 'side-habit' | 'negative-habit' | 'bonus';
  entityId: string;
  xpChange: number;
  timestamp: Date;
  description: string;
  streakChange?: number;
}

export function useXPSystem() {
  const [progress, setProgress] = useLocalStorage<UserProgress>('progress', {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
    lastCompletionDate: undefined
  });
  
  const [xpTransactions, setXpTransactions] = useLocalStorage<XPTransaction[]>('xp-transactions', []);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const { applyMultiplier } = useXPMultiplier();

  const calculateLevel = (totalXP: number): number => {
    return Math.floor(totalXP / 100) + 1;
  };

  const awardXP = useCallback((
    type: XPTransaction['type'],
    entityId: string,
    baseXP: number,
    description: string,
    streakChange: number = 0
  ) => {
    const finalXP = applyMultiplier(baseXP);
    
    const transaction: XPTransaction = {
      id: crypto.randomUUID(),
      type,
      entityId,
      xpChange: finalXP,
      timestamp: new Date(),
      description,
      streakChange
    };

    setXpTransactions(prev => [...prev, transaction]);
    
    setProgress(prev => {
      const newTotalXP = prev.totalXP + finalXP;
      const newLevel = calculateLevel(newTotalXP);
      const newStreak = Math.max(0, prev.currentStreak + streakChange);
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      
      if (newLevel > prev.level) {
        setShowLevelUp(newLevel);
      }
      
      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        lastCompletionDate: streakChange > 0 ? new Date() : prev.lastCompletionDate
      };
    });

    return transaction.id;
  }, [applyMultiplier, setProgress, setXpTransactions]);

  const undoXP = useCallback((transactionId: string) => {
    const transaction = xpTransactions.find(t => t.id === transactionId);
    if (!transaction) return false;

    // Remove the transaction
    setXpTransactions(prev => prev.filter(t => t.id !== transactionId));
    
    // Revert the XP and streak changes
    setProgress(prev => {
      const newTotalXP = Math.max(0, prev.totalXP - transaction.xpChange);
      const newLevel = calculateLevel(newTotalXP);
      const newStreak = Math.max(0, prev.currentStreak - (transaction.streakChange || 0));
      
      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        currentStreak: newStreak,
        // Note: We don't decrease maxStreak as it represents historical maximum
      };
    });

    return true;
  }, [xpTransactions, setProgress, setXpTransactions]);

  const getEntityTransactions = useCallback((entityId: string) => {
    return xpTransactions.filter(t => t.entityId === entityId);
  }, [xpTransactions]);

  const getTodaysTransactions = useCallback(() => {
    const today = new Date().toDateString();
    return xpTransactions.filter(t => new Date(t.timestamp).toDateString() === today);
  }, [xpTransactions]);

  return {
    progress,
    showLevelUp,
    setShowLevelUp,
    awardXP,
    undoXP,
    getEntityTransactions,
    getTodaysTransactions,
    xpTransactions
  };
}
