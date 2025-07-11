
import { useLocalStorage } from './useLocalStorage';
import { apiRequest } from '@/lib/queryClient';
import { useState, useEffect } from 'react';

export interface CustomCategory {
  id: string;
  name: string;
  type: 'task' | 'habit' | 'project' | 'goal';
  created_at: Date;
}

// Define the Supabase response type
interface SupabaseCustomCategory {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export function useCustomCategories() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiRequest('/api/categories');
      
      // Transform API data to match our interface
      const transformedData: CustomCategory[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type as 'task' | 'habit' | 'project' | 'goal',
        created_at: new Date(item.createdAt)
      }));
      
      setCategories(transformedData);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to localStorage if API fails
      const localCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
      setCategories(localCategories);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string, type: 'task' | 'habit' | 'project' | 'goal') => {
    try {
      const data = await apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name, type }),
      });
      
      // Transform the response data
      const transformedData: CustomCategory = {
        id: data.id,
        name: data.name,
        type: data.type as 'task' | 'habit' | 'project' | 'goal',
        created_at: new Date(data.createdAt)
      };
      
      setCategories(prev => [...prev, transformedData]);
      return transformedData;
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
