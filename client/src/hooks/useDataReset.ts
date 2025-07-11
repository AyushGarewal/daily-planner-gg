
import { supabase } from '@/integrations/supabase/client';

export function useDataReset() {
  const resetAllData = async () => {
    try {
      // Reset Supabase data if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase.rpc('reset_user_data', {
          target_user_id: user.id
        });
        
        if (error) {
          console.error('Error resetting Supabase data:', error);
        }
      }
    } catch (error) {
      console.error('Error resetting remote data:', error);
    }

    // Reset all localStorage data - comprehensive list including new habit data
    const keysToReset = [
      'tasks',
      'userProgress',
      'progress',
      'bonusXP',
      'dailyUsage',
      'showLevelUp',
      'dailyReflections',
      'customCategories',
      'projects',
      'goals',
      'challenges',
      'userStats',
      'moodEntries',
      'journalEntries',
      'sleepData',
      'achievements',
      'routines',
      'longTermGoalsProgress',
      'habitData',
      'habitStreaks',
      'weeklyData',
      'monthlyData',
      'trophies',
      'customTrophies',
      'powerUps',
      'inventory',
      'streakShields',
      'completedTasks',
      'failedTasks',
      'xpHistory',
      'levelHistory',
      'motivationQuotes',
      'app-theme',
      'userPreferences',
      'gameSettings',
      'notificationSettings',
      'sideHabits',
      'negativeHabits',
      'goal-journal-entries',
      'goal-milestones',
      'goal-subtasks'
    ];

    keysToReset.forEach(key => {
      localStorage.removeItem(key);
    });

    // Reset to initial values with proper defaults
    localStorage.setItem('userProgress', JSON.stringify({
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      maxStreak: 0,
    }));

    localStorage.setItem('progress', JSON.stringify({
      totalXP: 0,
      level: 1,
      tasksCompleted: 0,
      habitsCompleted: 0,
      dailyCompletionRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      maxStreak: 0,
    }));

    localStorage.setItem('userStats', JSON.stringify({
      achievements: [],
      powerUps: [],
      streakShields: 0,
      theme: 'light',
      customTrophies: []
    }));

    localStorage.setItem('app-theme', 'light');

    // Clear any remaining app-specific localStorage items
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('task-') || key.startsWith('habit-') || key.startsWith('goal-') || key.startsWith('project-'))) {
        localStorage.removeItem(key);
      }
    }

    // Reload the page to apply changes
    window.location.reload();
  };

  const confirmReset = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset ALL data? This will permanently delete:\n\n' +
      '• All tasks and habits\n' +
      '• Progress and XP\n' +
      '• Projects and goals\n' +
      '• Daily reflections\n' +
      '• Achievements and trophies\n' +
      '• Custom categories\n' +
      '• Routines and challenges\n' +
      '• Theme and preferences\n' +
      '• Side habits and negative habits\n' +
      '• All other app data\n\n' +
      'This action cannot be undone!'
    );

    if (confirmed) {
      resetAllData();
    }
  };

  return { resetAllData, confirmReset };
}
