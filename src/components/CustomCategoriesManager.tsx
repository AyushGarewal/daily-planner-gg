
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, Settings } from 'lucide-react';
import { useCustomCategories } from '../hooks/useCustomCategories';

export function CustomCategoriesManager() {
  const { categories, addCategory, getCategoriesByType, loading } = useCustomCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'task' | 'habit' | 'project' | 'goal'>('task');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await addCategory(newCategoryName.trim(), newCategoryType);
      setNewCategoryName('');
      setNewCategoryType('task');
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const categoryTypes = [
    { value: 'task', label: 'Tasks' },
    { value: 'habit', label: 'Habits' },
    { value: 'project', label: 'Projects' },
    { value: 'goal', label: 'Goals' }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Categories
          </CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
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
                      {categoryTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddCategory} className="flex-1">
                    Add Category
                  </Button>
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">
          Create and manage custom categories for better organization
        </p>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No custom categories yet.</p>
            <p className="text-xs">Create categories to better organize your tasks and habits.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryTypes.map((type) => {
              const typeCategories = getCategoriesByType(type.value as 'task' | 'habit' | 'project' | 'goal');
              
              if (typeCategories.length === 0) return null;
              
              return (
                <div key={type.value} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    {type.label}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {typeCategories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <span className="text-sm">{category.name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit category"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title="Delete category"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
