import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { addDays, startOfWeek, getDay, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';

export function useHabitRecurrence() {
  // Generate recurring habit instances for a given date range
  const generateRecurringHabits = (baseHabits: Task[], startDate: Date, endDate: Date): Task[] => {
    const recurringHabits: Task[] = [];
    
    baseHabits
      .filter(habit => habit.type === 'habit' && habit.recurrence !== 'None' && !habit.isRecurringInstance)
      .forEach(baseHabit => {
        const instances = generateHabitInstances(baseHabit, startDate, endDate);
        recurringHabits.push(...instances);
      });
    
    return recurringHabits;
  };

  const generateHabitInstances = (baseHabit: Task, startDate: Date, endDate: Date): Task[] => {
    const instances: Task[] = [];
    const habitCreationDate = new Date(baseHabit.dueDate);
    
    // For newly created habits, start generation from the next day to prevent duplicates
    // This ensures we don't create an instance for today when the habit was just created
    const nextDay = addDays(habitCreationDate, 1);
    const generationStart = isAfter(startDate, nextDay) ? startDate : nextDay;
    
    console.log(`Generating instances for habit: ${baseHabit.title}, recurrence: ${baseHabit.recurrence}`);
    
    switch (baseHabit.recurrence) {
      case 'Daily':
        generateDailyInstances(baseHabit, generationStart, endDate, instances);
        break;
      case 'Weekly':
        generateWeeklyInstances(baseHabit, generationStart, endDate, instances);
        break;
      case 'Custom':
        generateCustomFrequencyInstances(baseHabit, generationStart, endDate, instances);
        break;
    }
    
    console.log(`Generated ${instances.length} instances for ${baseHabit.title}`);
    return instances;
  };

  const generateDailyInstances = (baseHabit: Task, startDate: Date, endDate: Date, instances: Task[]) => {
    let currentDate = new Date(startDate);
    
    while (!isAfter(currentDate, endDate)) {
      instances.push(createHabitInstance(baseHabit, new Date(currentDate)));
      currentDate = addDays(currentDate, 1);
    }
  };

  const generateWeeklyInstances = (baseHabit: Task, startDate: Date, endDate: Date, instances: Task[]) => {
    if (!baseHabit.weekDays || baseHabit.weekDays.length === 0) return;
    
    let currentDate = new Date(startDate);
    
    while (!isAfter(currentDate, endDate)) {
      const dayOfWeek = getDay(currentDate);
      
      if (baseHabit.weekDays.includes(dayOfWeek)) {
        instances.push(createHabitInstance(baseHabit, new Date(currentDate)));
      }
      
      currentDate = addDays(currentDate, 1);
    }
  };

  const generateCustomFrequencyInstances = (baseHabit: Task, startDate: Date, endDate: Date, instances: Task[]) => {
    if (!baseHabit.customFrequency || baseHabit.customFrequency <= 0) return;
    
    const frequency = baseHabit.customFrequency;
    let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Start on Monday
    
    while (!isAfter(currentWeekStart, endDate)) {
      // Generate instances for this week
      const weekEnd = addDays(currentWeekStart, 6);
      
      // For custom frequency, distribute the habit instances across the week
      const daysInWeek = Math.min(7, frequency);
      const daySpacing = Math.floor(7 / daysInWeek);
      
      for (let i = 0; i < frequency && i < 7; i++) {
        const instanceDate = addDays(currentWeekStart, i * daySpacing);
        
        // Only add if the date is within our range
        if (!isBefore(instanceDate, startDate) && !isAfter(instanceDate, endDate)) {
          const instance = createHabitInstance(baseHabit, instanceDate);
          instance.recurringWeeklyCount = 0; // Track weekly completions
          instance.weekStartDate = new Date(currentWeekStart);
          instances.push(instance);
        }
      }
      
      currentWeekStart = addDays(currentWeekStart, 7);
    }
  };

  const createHabitInstance = (baseHabit: Task, date: Date): Task => {
    return {
      ...baseHabit,
      id: `${baseHabit.id}_${date.toISOString().split('T')[0]}`,
      dueDate: new Date(date),
      completed: false,
      completedAt: undefined,
      isRecurringInstance: true,
      parentHabitId: baseHabit.id,
      baseHabitId: baseHabit.id,
    };
  };

  // Delete recurring instances for a base habit
  const deleteRecurringInstances = (baseHabitId: string, allTasks: Task[]): Task[] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    console.log(`Deleting future recurring instances for habit: ${baseHabitId}`);
    
    return allTasks.filter(task => {
      // Keep tasks that are not recurring instances of this habit
      if (task.parentHabitId !== baseHabitId || !task.isRecurringInstance) {
        return true;
      }
      
      // Keep past instances (already completed or before today)
      const taskDate = startOfDay(new Date(task.dueDate));
      return isBefore(taskDate, now);
    });
  };

  // Update all future recurring instances when a base habit is edited
  const updateFutureHabitInstances = (updatedBaseHabit: Task, allTasks: Task[]): Task[] => {
    console.log(`Updating future instances for habit: ${updatedBaseHabit.title}`);
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    return allTasks.map(task => {
      // Update recurring instances that are today or in the future
      if (task.parentHabitId === updatedBaseHabit.id && 
          task.isRecurringInstance && 
          !isBefore(new Date(task.dueDate), now)) {
        
        console.log(`Updating instance: ${task.id} for date: ${task.dueDate}`);
        
        return {
          ...task,
          title: updatedBaseHabit.title,
          description: updatedBaseHabit.description,
          xpValue: updatedBaseHabit.xpValue,
          category: updatedBaseHabit.category,
          priority: updatedBaseHabit.priority,
          subtasks: updatedBaseHabit.subtasks.map(st => ({ ...st, completed: false })), // Reset subtask completion for future instances
          recurrence: updatedBaseHabit.recurrence,
          weekDays: updatedBaseHabit.weekDays,
          customFrequency: updatedBaseHabit.customFrequency,
          projectId: updatedBaseHabit.projectId,
          goalId: updatedBaseHabit.goalId,
        };
      }
      return task;
    });
  };

  // Check if we need to generate more recurring habits
  const checkAndGenerateRecurringHabits = (tasks: Task[], targetDate: Date = new Date()): Task[] => {
    const baseHabits = tasks.filter(task => task.type === 'habit' && !task.isRecurringInstance);
    
    if (baseHabits.length === 0) return tasks;
    
    // Generate habits for the next 30 days from target date
    const endDate = addDays(targetDate, 30);
    const newRecurringHabits = generateRecurringHabits(baseHabits, targetDate, endDate);
    
    // Filter out habits that already exist
    const existingIds = new Set(tasks.map(task => task.id));
    const uniqueNewHabits = newRecurringHabits.filter(habit => !existingIds.has(habit.id));
    
    console.log(`Generated ${uniqueNewHabits.length} new recurring habit instances`);
    
    return [...tasks, ...uniqueNewHabits];
  };

  return {
    generateRecurringHabits,
    updateFutureHabitInstances,
    checkAndGenerateRecurringHabits,
    createHabitInstance,
    deleteRecurringInstances
  };
}
