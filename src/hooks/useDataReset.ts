
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

    // Reset all localStorage data
    const keysToReset = [
      'tasks',
      'userProgress',
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
      'longTermGoalsProgress'
    ];

    keysToReset.forEach(key => {
      localStorage.removeItem(key);
    });

    // Reset to initial values
    localStorage.setItem('userProgress', JSON.stringify({
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      maxStreak: 0,
    }));

    localStorage.setItem('userStats', JSON.stringify({
      achievements: [],
      powerUps: [],
      streakShields: 0,
      theme: 'light',
      customTrophies: []
    }));

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
      '• All other app data\n\n' +
      'This action cannot be undone!'
    );

    if (confirmed) {
      resetAllData();
    }
  };

  return { resetAllData, confirmReset };
}
