
import { useLocalStorage } from './useLocalStorage';
import { apiRequest } from '@/lib/queryClient';
import { useState, useEffect } from 'react';

export interface DailyReflection {
  id: string;
  userId?: string;
  reflectionDate: string; // YYYY-MM-DD format
  mood?: number; // 1-5
  content?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function useDailyReflections() {
  const [reflections, setReflections] = useLocalStorage<DailyReflection[]>('dailyReflections', []);
  const [loading, setLoading] = useState(false);

  const addReflection = async (reflection: Omit<DailyReflection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReflection: DailyReflection = {
      ...reflection,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Try to save to the API first
      const userId = 'default-user'; // For now, using a default user ID
      await apiRequest('/api/reflections', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          reflectionDate: reflection.reflectionDate,
          mood: reflection.mood,
          content: reflection.content,
          tags: reflection.tags,
        }),
      });
    } catch (error) {
      console.error('Error saving to API:', error);
      // Continue with localStorage fallback
    }

    // Update local state regardless
    setReflections(prev => {
      const filtered = prev.filter(r => r.reflectionDate !== reflection.reflectionDate);
      return [...filtered, newReflection].sort((a, b) => 
        new Date(b.reflectionDate).getTime() - new Date(a.reflectionDate).getTime()
      );
    });

    return newReflection;
  };

  const getReflectionByDate = (date: string) => {
    return reflections.find(r => r.reflectionDate === date);
  };

  const updateReflection = async (id: string, updates: Partial<DailyReflection>) => {
    const updatedReflection = { ...updates, updatedAt: new Date() };

    try {
      await apiRequest(`/api/reflections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedReflection),
      });
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
