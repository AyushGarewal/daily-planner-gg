
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export interface DailyReflection {
  id: string;
  user_id?: string;
  reflection_date: string; // YYYY-MM-DD format
  mood?: number; // 1-5
  content?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export function useDailyReflections() {
  const [reflections, setReflections] = useLocalStorage<DailyReflection[]>('dailyReflections', []);
  const [loading, setLoading] = useState(false);

  const addReflection = async (reflection: Omit<DailyReflection, 'id' | 'created_at' | 'updated_at'>) => {
    const newReflection: DailyReflection = {
      ...reflection,
      id: crypto.randomUUID(),
      created_at: new Date(),
      updated_at: new Date()
    };

    try {
      // Try to save to Supabase first - need to get user_id from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('daily_reflections')
          .insert([{
            reflection_date: reflection.reflection_date,
            mood: reflection.mood,
            content: reflection.content,
            tags: reflection.tags,
            user_id: user.id
          }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      // Continue with localStorage fallback
    }

    // Update local state regardless
    setReflections(prev => {
      const filtered = prev.filter(r => r.reflection_date !== reflection.reflection_date);
      return [...filtered, newReflection].sort((a, b) => 
        new Date(b.reflection_date).getTime() - new Date(a.reflection_date).getTime()
      );
    });

    return newReflection;
  };

  const getReflectionByDate = (date: string) => {
    return reflections.find(r => r.reflection_date === date);
  };

  const updateReflection = async (id: string, updates: Partial<DailyReflection>) => {
    const updatedReflection = { ...updates, updated_at: new Date() };

    try {
      // Convert Date objects to strings for Supabase
      const supabaseUpdates: any = { ...updatedReflection };
      if (supabaseUpdates.created_at instanceof Date) {
        supabaseUpdates.created_at = supabaseUpdates.created_at.toISOString();
      }
      if (supabaseUpdates.updated_at instanceof Date) {
        supabaseUpdates.updated_at = supabaseUpdates.updated_at.toISOString();
      }

      const { error } = await supabase
        .from('daily_reflections')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reflection:', error);
    }

    setReflections(prev => prev.map(r => 
      r.id === id ? { ...r, ...updatedReflection } : r
    ));
  };

  return {
    reflections,
    loading,
    addReflection,
    getReflectionByDate,
    updateReflection
  };
}
