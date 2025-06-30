
import { useState, useEffect } from 'react';
import { Goal, GoalJournalEntry, Milestone, Subtask, GoalProgress } from '../types/goals';
import { useLocalStorage } from './useLocalStorage';

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [journalEntries, setJournalEntries] = useLocalStorage<GoalJournalEntry[]>('goal-journal-entries', []);
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>('goal-milestones', []);
  const [subtasks, setSubtasks] = useLocalStorage<Subtask[]>('goal-subtasks', []);

  const addGoal = (goalData: Omit<Goal, 'id' | 'isCompleted' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      currentProgress: 0
    };
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, ...updates, updatedAt: new Date() }
        : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    setJournalEntries(prev => prev.filter(entry => entry.goalId !== goalId));
    setMilestones(prev => prev.filter(milestone => milestone.goalId !== goalId));
    // Also remove subtasks for milestones of this goal
    const goalMilestoneIds = milestones.filter(m => m.goalId === goalId).map(m => m.id);
    setSubtasks(prev => prev.filter(subtask => !goalMilestoneIds.includes(subtask.milestoneId)));
  };

  const addJournalEntry = (entryData: Omit<GoalJournalEntry, 'id' | 'createdAt'>) => {
    const newEntry: GoalJournalEntry = {
      ...entryData,
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    setJournalEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const addMilestone = (milestoneData: Omit<Milestone, 'id' | 'isCompleted' | 'createdAt'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCompleted: false,
      createdAt: new Date()
    };
    setMilestones(prev => [...prev, newMilestone]);
    return newMilestone;
  };

  const updateMilestone = (milestoneId: string, updates: Partial<Milestone>) => {
    setMilestones(prev => prev.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, ...updates, ...(updates.isCompleted ? { completedAt: new Date() } : {}) }
        : milestone
    ));
  };

  const addSubtask = (subtaskData: Omit<Subtask, 'id' | 'isCompleted' | 'createdAt'>) => {
    const newSubtask: Subtask = {
      ...subtaskData,
      id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCompleted: false,
      createdAt: new Date()
    };
    setSubtasks(prev => [...prev, newSubtask]);
    return newSubtask;
  };

  const updateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    setSubtasks(prev => prev.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, ...updates, ...(updates.isCompleted ? { completedAt: new Date() } : {}) }
        : subtask
    ));
  };

  const getGoalProgress = (goalId: string): GoalProgress => {
    const goal = goals.find(g => g.id === goalId);
    const goalMilestones = milestones.filter(m => m.goalId === goalId);
    const goalMilestoneIds = goalMilestones.map(m => m.id);
    const goalSubtasks = subtasks.filter(s => goalMilestoneIds.includes(s.milestoneId));
    
    const totalSubtasks = goalSubtasks.length;
    const completedSubtasks = goalSubtasks.filter(s => s.isCompleted).length;
    const percentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return {
      goalId,
      totalSubtasks,
      completedSubtasks,
      percentage,
      numericProgress: goal?.currentProgress || 0,
      numericTarget: goal?.numericTarget
    };
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.hasNumericTarget) {
      updateGoal(goalId, { 
        currentProgress: Math.min(progress, goal.numericTarget || 0),
        isCompleted: progress >= (goal.numericTarget || 0)
      });
    }
  };

  const incrementGoalProgress = (goalId: string, amount: number = 1) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.hasNumericTarget) {
      const newProgress = (goal.currentProgress || 0) + amount;
      updateGoalProgress(goalId, newProgress);
    }
  };

  const getMilestonesForGoal = (goalId: string) => {
    return milestones.filter(m => m.goalId === goalId);
  };

  const getSubtasksForMilestone = (milestoneId: string) => {
    return subtasks.filter(s => s.milestoneId === milestoneId);
  };

  const getJournalEntriesForGoal = (goalId: string) => {
    return journalEntries.filter(e => e.goalId === goalId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addJournalEntry,
    addMilestone,
    updateMilestone,
    addSubtask,
    updateSubtask,
    getGoalProgress,
    updateGoalProgress,
    incrementGoalProgress,
    getMilestonesForGoal,
    getSubtasksForMilestone,
    getJournalEntriesForGoal
  };
}
