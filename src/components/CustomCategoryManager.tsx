
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { useCustomCategories } from '../hooks/useCustomCategories';

interface CustomCategoryManagerProps {
  defaultType?: 'task' | 'habit' | 'project' | 'goal';
}

export function CustomCategoryManager({ defaultType = 'task' }: CustomCategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'task' | 'habit' | 'project' | 'goal'>(defaultType);
  
  const { categories, addCategory, loading } = useCustomCategories();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await addCategory(newCategoryName.trim(), newCategoryType);
      setNewCategoryName('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name..."
            />
          </div>
          
          <div>
            <Label htmlFor="categoryType">Category Type</Label>
            <Select value={newCategoryType} onValueChange={(value: 'task' | 'habit' | 'project' | 'goal') => setNewCategoryType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="habit">Habit</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="goal">Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {categories.length > 0 && (
            <div>
              <Label>Existing Custom Categories</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between text-sm p-2 border rounded">
                    <span>{category.name} ({category.type})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleAddCategory} disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Category'}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
