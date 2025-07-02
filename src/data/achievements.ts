
import { Achievement, SpinReward } from '../types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete 5 tasks before 9 AM',
    icon: '🌅',
    isUnlocked: false,
    unlocked: false,
    category: 'task',
    requirement: {
      type: 'task_completion',
      value: 5,
      description: 'Complete 5 tasks before 9 AM'
    }
  },
  {
    id: 'streak-boss',
    title: 'Streak Boss',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    isUnlocked: false,
    unlocked: false,
    category: 'streak',
    requirement: {
      type: 'streak',
      value: 7,
      description: 'Maintain a 7-day streak'
    }
  },
  {
    id: 'procrastinator-no-more',
    title: 'Procrastinator No More',
    description: 'Finish a task a day early',
    icon: '⚡',
    isUnlocked: false,
    unlocked: false,
    category: 'task',
    requirement: {
      type: 'task_completion',
      value: 1,
      description: 'Finish a task a day early'
    }
  },
  {
    id: 'level-master',
    title: 'Level Master',
    description: 'Reach level 5',
    icon: '👑',
    isUnlocked: false,
    unlocked: false,
    category: 'level',
    requirement: {
      type: 'level',
      value: 5,
      description: 'Reach level 5'
    }
  },
  {
    id: 'task-destroyer',
    title: 'Task Destroyer',
    description: 'Complete 100 tasks',
    icon: '💪',
    isUnlocked: false,
    unlocked: false,
    category: 'task',
    requirement: {
      type: 'task_completion',
      value: 100,
      description: 'Complete 100 tasks'
    }
  },
];

export const SPIN_REWARDS: SpinReward[] = [
  { 
    id: 'bonus-xp-25', 
    title: '+25 Bonus XP', 
    type: 'xp', 
    value: 25, 
    probability: 30,
    description: 'Instant XP boost!'
  },
  { 
    id: 'bonus-xp-50', 
    title: '+50 Bonus XP', 
    type: 'xp', 
    value: 50, 
    probability: 20,
    description: 'Big XP reward!'
  },
  { 
    id: 'streak-shield', 
    title: 'Streak Shield', 
    type: 'streak-shield', 
    value: 1, 
    probability: 15,
    description: 'Protects your streak for one day'
  },
  { 
    id: 'double-xp', 
    title: 'Double XP Next Day', 
    type: 'power-up', 
    value: 'double-xp', 
    probability: 15,
    description: '2x XP for the next day'
  },
  { 
    id: 'auto-complete', 
    title: 'Auto-Complete Task', 
    type: 'power-up', 
    value: 'auto-complete', 
    probability: 10,
    description: 'Automatically complete any task'
  },
  { 
    id: 'bonus-xp-100', 
    title: '+100 Bonus XP', 
    type: 'xp', 
    value: 100, 
    probability: 10,
    description: 'Massive XP reward!'
  },
];

export const THEMES = [
  { id: 'light', name: 'Light', unlockLevel: 0 },
  { id: 'dark', name: 'Dark', unlockLevel: 0 },
  { id: 'ocean', name: 'Ocean Blue', unlockLevel: 3 },
  { id: 'forest', name: 'Forest Green', unlockLevel: 5 },
  { id: 'sunset', name: 'Sunset Orange', unlockLevel: 8 },
];
