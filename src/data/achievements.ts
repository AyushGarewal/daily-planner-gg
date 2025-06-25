
import { Achievement, SpinReward } from '../types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete 5 tasks before 9 AM',
    icon: '🌅',
    condition: (data) => data.earlyBirdCount >= 5,
    unlocked: false,
  },
  {
    id: 'streak-boss',
    title: 'Streak Boss',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    condition: (data) => data.currentStreak >= 7,
    unlocked: false,
  },
  {
    id: 'procrastinator-no-more',
    title: 'Procrastinator No More',
    description: 'Finish a task a day early',
    icon: '⚡',
    condition: (data) => data.hasEarlyCompletion,
    unlocked: false,
  },
  {
    id: 'level-master',
    title: 'Level Master',
    description: 'Reach level 5',
    icon: '👑',
    condition: (data) => data.level >= 5,
    unlocked: false,
  },
  {
    id: 'task-destroyer',
    title: 'Task Destroyer',
    description: 'Complete 100 tasks',
    icon: '💪',
    condition: (data) => data.totalTasksCompleted >= 100,
    unlocked: false,
  },
];

export const SPIN_REWARDS: SpinReward[] = [
  { id: 'bonus-xp-25', title: '+25 Bonus XP', type: 'xp', value: 25, probability: 30 },
  { id: 'bonus-xp-50', title: '+50 Bonus XP', type: 'xp', value: 50, probability: 20 },
  { id: 'streak-shield', title: 'Streak Shield', type: 'streak-shield', value: 1, probability: 15 },
  { id: 'double-xp', title: 'Double XP Next Day', type: 'power-up', value: 'double-xp', probability: 15 },
  { id: 'auto-complete', title: 'Auto-Complete Task', type: 'power-up', value: 'auto-complete', probability: 10 },
  { id: 'bonus-xp-100', title: '+100 Bonus XP', type: 'xp', value: 100, probability: 10 },
];

export const THEMES = [
  { id: 'light', name: 'Light', unlockLevel: 0 },
  { id: 'dark', name: 'Dark', unlockLevel: 0 },
  { id: 'ocean', name: 'Ocean Blue', unlockLevel: 3 },
  { id: 'forest', name: 'Forest Green', unlockLevel: 5 },
  { id: 'sunset', name: 'Sunset Orange', unlockLevel: 8 },
];
