
import { SpinReward } from '../types/achievements';

export const SPIN_REWARDS: SpinReward[] = [
  {
    id: 'bonus-xp-50',
    title: '+50 Bonus XP',
    type: 'xp',
    value: 50,
    probability: 0.25,
    description: 'Instant XP boost!'
  },
  {
    id: 'bonus-xp-100',
    title: '+100 Bonus XP',
    type: 'xp',
    value: 100,
    probability: 0.15,
    description: 'Big XP reward!'
  },
  {
    id: 'streak-shield',
    title: 'Streak Shield',
    type: 'streak-shield',
    value: 1,
    probability: 0.20,
    description: 'Protects your streak for one day'
  },
  {
    id: 'auto-complete',
    title: 'Auto-Complete Token',
    type: 'power-up',
    value: 'auto-complete',
    probability: 0.15,
    description: 'Automatically complete any task'
  },
  {
    id: 'xp-multiplier',
    title: 'XP Multiplier (1.5x)',
    type: 'power-up',
    value: 'xp-multiplier',
    probability: 0.10,
    description: '1.5x XP for the next hour'
  },
  {
    id: 'skip-token',
    title: 'Skip Token',
    type: 'power-up',
    value: 'skip-token',
    probability: 0.08,
    description: 'Skip any task without penalty'
  },
  {
    id: 'motivation-quote',
    title: 'Motivation Quote',
    type: 'quote',
    value: 'motivation',
    probability: 0.05,
    description: 'Inspiring words for your journey'
  },
  {
    id: 'custom-trophy',
    title: 'Free Custom Trophy',
    type: 'trophy',
    value: 'custom',
    probability: 0.02,
    description: 'Create a custom achievement for free'
  }
];

export const MOTIVATION_QUOTES = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "In the middle of difficulty lies opportunity. - Albert Einstein",
  "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill"
];
