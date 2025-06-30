
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export interface CustomCategory {
  id: string;
  name: string;
  type: 'task' | 'habit' | 'project' | 'goal';
  created_at: Date;
}

export function useCustomCategories() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to localStorage if Supabase fails
      const localCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
      setCategories(localCategories);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string, type: 'task' | 'habit' | 'project' | 'goal') => {
    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert([{ name, type }])
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      
      // Fallback to localStorage
      const newCategory: CustomCategory = {
        id: crypto.randomUUID(),
        name,
        type,
        created_at: new Date()
      };
      
      setCategories(prev => [...prev, newCategory]);
      localStorage.setItem('customCategories', JSON.stringify([...categories, newCategory]));
      return newCategory;
    }
  };

  const getCategoriesByType = (type: 'task' | 'habit' | 'project' | 'goal') => {
    return categories.filter(cat => cat.type === type);
  };

  return {
    categories,
    loading,
    addCategory,
    getCategoriesByType,
    refetch: loadCategories
  };
}
