
export interface Project {
  id: string;
  name: string;
  description?: string;
  category: 'short-term' | 'long-term' | 'ongoing';
  startDate?: Date;
  targetDate?: Date;
  color: string;
  icon: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  tasks: ProjectTask[]; // Changed from string[] to ProjectTask[]
  habits: string[]; // habit IDs  
  notes: ProjectNote[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTask {
  id: string;
  title: string;
  dueDate?: Date;
  completed: boolean;
  subtasks: ProjectSubtask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectNote {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PROJECT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
];

export const PROJECT_ICONS = [
  '🎯', '📋', '🚀', '💼', '🏠', '📚', '💪', '🎨', '💰', '🌱'
];
