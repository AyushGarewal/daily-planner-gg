
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { CATEGORIES } from '../types/task';

interface TaskFiltersProps {
  filters: {
    category?: string;
    priority?: string;
    completed?: boolean;
  };
  sortBy: 'dueDate' | 'xpValue' | 'priority';
  onFilterChange: (filters: any) => void;
  onSortChange: (sortBy: 'dueDate' | 'xpValue' | 'priority') => void;
  onClearFilters: () => void;
}

export function TaskFilters({ 
  filters, 
  sortBy, 
  onFilterChange, 
  onSortChange, 
  onClearFilters 
}: TaskFiltersProps) {
  const hasActiveFilters = Object.keys(filters).some(key => filters[key] !== undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        
        <Select 
          value={filters.category || 'all'} 
          onValueChange={(value) => 
            onFilterChange({ 
              ...filters, 
              category: value === 'all' ? undefined : value 
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.priority || 'all'} 
          onValueChange={(value) => 
            onFilterChange({ 
              ...filters, 
              priority: value === 'all' ? undefined : value 
            })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.completed === undefined ? 'all' : (filters.completed ? 'completed' : 'pending')} 
          onValueChange={(value) => 
            onFilterChange({ 
              ...filters, 
              completed: value === 'all' ? undefined : value === 'completed' 
            })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={sortBy} 
          onValueChange={(value) => onSortChange(value as 'dueDate' | 'xpValue' | 'priority')}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="xpValue">XP Value</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex gap-2 flex-wrap">
          {filters.category && (
            <Badge variant="secondary">Category: {filters.category}</Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary">Priority: {filters.priority}</Badge>
          )}
          {filters.completed !== undefined && (
            <Badge variant="secondary">
              Status: {filters.completed ? 'Completed' : 'Pending'}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
