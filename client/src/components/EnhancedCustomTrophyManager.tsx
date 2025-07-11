
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trophy, Edit, Trash2, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CustomTrophy, CustomTrophyCondition } from '../types/achievements';
import { CATEGORIES } from '../types/task';

const TROPHY_ICONS = ['🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💎', '👑', '🎯', '🔥', '⚡', '💪', '🚀', '🎪', '🌈', '💫'];

const CONDITION_TYPES = [
  { value: 'streak', label: 'Daily Streak' },
  { value: 'tasks_completed', label: 'Total Tasks Completed' },
  { value: 'early_bird', label: 'Early Bird Tasks (before 9 AM)' },
  { value: 'level_reached', label: 'Level Reached' },
  { value: 'category_tasks', label: 'Category-Specific Tasks' },
  { value: 'xp_gained', label: 'Total XP Gained' },
  { value: 'completion_time', label: 'Completion Time Range' },
];

const TIMEFRAMES = [
  { value: 'all_time', label: 'All Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const OPERATORS = [
  { value: 'gte', label: 'Greater than or equal to' },
  { value: 'lte', label: 'Less than or equal to' },
  { value: 'eq', label: 'Equal to' },
];

interface EnhancedCustomTrophyManagerProps {
  onTrophyCheck: (trophies: CustomTrophy[]) => CustomTrophy[];
}

export function EnhancedCustomTrophyManager({ onTrophyCheck }: EnhancedCustomTrophyManagerProps) {
  const [customTrophies, setCustomTrophies] = useLocalStorage<CustomTrophy[]>('enhancedCustomTrophies', []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTrophy, setEditingTrophy] = useState<CustomTrophy | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    xpReward: 50,
    requiresAll: true,
    conditions: [] as CustomTrophyCondition[]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      xpReward: 50,
      requiresAll: true,
      conditions: []
    });
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        type: 'streak',
        value: 1,
        operator: 'gte',
        timeframe: 'all_time'
      }]
    }));
  };

  const updateCondition = (index: number, updates: Partial<CustomTrophyCondition>) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) => 
        i === index ? { ...cond, ...updates } : cond
      )
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = () => {
    if (!formData.name.trim() || formData.conditions.length === 0) return;

    const newTrophy: CustomTrophy = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      conditions: formData.conditions,
      xpReward: formData.xpReward,
      requiresAll: formData.requiresAll,
      unlocked: false
    };

    setCustomTrophies(prev => [...prev, newTrophy]);
    setIsCreating(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingTrophy || !formData.name.trim() || formData.conditions.length === 0) return;

    setCustomTrophies(prev => prev.map(trophy => 
      trophy.id === editingTrophy.id 
        ? {
            ...trophy,
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            conditions: formData.conditions,
            xpReward: formData.xpReward,
            requiresAll: formData.requiresAll
          }
        : trophy
    ));
    setEditingTrophy(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setCustomTrophies(prev => prev.filter(trophy => trophy.id !== id));
  };

  const startEdit = (trophy: CustomTrophy) => {
    setEditingTrophy(trophy);
    setFormData({
      name: trophy.name,
      description: trophy.description,
      icon: trophy.icon,
      xpReward: trophy.xpReward,
      requiresAll: trophy.requiresAll || true,
      conditions: trophy.conditions
    });
  };

  const getConditionDescription = (condition: CustomTrophyCondition) => {
    let desc = '';
    switch (condition.type) {
      case 'streak':
        desc = `${condition.operator === 'gte' ? '≥' : condition.operator === 'lte' ? '≤' : '='} ${condition.value} day streak`;
        break;
      case 'tasks_completed':
        desc = `${condition.operator === 'gte' ? '≥' : condition.operator === 'lte' ? '≤' : '='} ${condition.value} tasks`;
        if (condition.category) desc += ` in ${condition.category}`;
        break;
      case 'early_bird':
        desc = `${condition.operator === 'gte' ? '≥' : condition.operator === 'lte' ? '≤' : '='} ${condition.value} early bird tasks`;
        break;
      case 'level_reached':
        desc = `Reach level ${condition.value}`;
        break;
      case 'xp_gained':
        desc = `${condition.operator === 'gte' ? '≥' : condition.operator === 'lte' ? '≤' : '='} ${condition.value} XP`;
        break;
      default:
        desc = 'Custom condition';
    }
    
    if (condition.timeframe && condition.timeframe !== 'all_time') {
      desc += ` (${condition.timeframe})`;
    }
    
    return desc;
  };

  const unlockedCount = customTrophies.filter(t => t.unlocked).length;

  const renderConditionForm = (condition: CustomTrophyCondition, index: number) => (
    <div key={index} className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Condition {index + 1}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeCondition(index)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium">Type</label>
          <Select
            value={condition.type}
            onValueChange={(value) => updateCondition(index, { type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium">Operator</label>
          <Select
            value={condition.operator || 'gte'}
            onValueChange={(value) => updateCondition(index, { operator: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium">Target Value</label>
          <Input
            type="number"
            min="1"
            value={condition.value}
            onChange={(e) => updateCondition(index, { value: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div>
          <label className="text-xs font-medium">Timeframe</label>
          <Select
            value={condition.timeframe || 'all_time'}
            onValueChange={(value) => updateCondition(index, { timeframe: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {condition.type === 'category_tasks' && (
        <div>
          <label className="text-xs font-medium">Category</label>
          <Select
            value={condition.category || ''}
            onValueChange={(value) => updateCondition(index, { category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
        Preview: {getConditionDescription(condition)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Enhanced Custom Trophies
          </h2>
          <p className="text-muted-foreground">
            {unlockedCount} of {customTrophies.length} custom trophies unlocked
          </p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Trophy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Enhanced Custom Trophy</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Trophy Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter trophy name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">XP Reward</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 50 })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this trophy represents"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Icon</label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {TROPHY_ICONS.map((icon) => (
                    <Button
                      key={icon}
                      variant={formData.icon === icon ? "default" : "outline"}
                      className="text-lg h-10"
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Condition Logic</label>
                  <p className="text-xs text-muted-foreground">
                    {formData.requiresAll ? 'ALL conditions must be met' : 'ANY condition can be met'}
                  </p>
                </div>
                <Switch
                  checked={formData.requiresAll}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresAll: checked })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Conditions ({formData.conditions.length})</label>
                  <Button onClick={addCondition} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.conditions.map((condition, index) => 
                    renderConditionForm(condition, index)
                  )}
                  
                  {formData.conditions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No conditions added yet. Add at least one condition.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleCreate} className="flex-1" disabled={!formData.name.trim() || formData.conditions.length === 0}>
                  Create Trophy
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog - Similar structure but with edit handler */}
      <Dialog open={!!editingTrophy} onOpenChange={(open) => !open && setEditingTrophy(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trophy</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Same form structure as create, but with handleEdit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Trophy Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter trophy name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">XP Reward</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 50 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this trophy represents"
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Icon</label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {TROPHY_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    variant={formData.icon === icon ? "default" : "outline"}
                    className="text-lg h-10"
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Condition Logic</label>
                <p className="text-xs text-muted-foreground">
                  {formData.requiresAll ? 'ALL conditions must be met' : 'ANY condition can be met'}
                </p>
              </div>
              <Switch
                checked={formData.requiresAll}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresAll: checked })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Conditions ({formData.conditions.length})</label>
                <Button onClick={addCondition} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Condition
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.conditions.map((condition, index) => 
                  renderConditionForm(condition, index)
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleEdit} className="flex-1" disabled={!formData.name.trim() || formData.conditions.length === 0}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingTrophy(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trophy List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customTrophies.map((trophy) => (
          <Card key={trophy.id} className={`${trophy.unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/30 dark:to-orange-900/30' : 'opacity-60'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{trophy.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{trophy.name}</CardTitle>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {trophy.unlocked && trophy.unlockedAt && (
                        <Badge variant="secondary" className="text-xs">
                          Unlocked!
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        +{trophy.xpReward} XP
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {trophy.requiresAll ? 'AND' : 'OR'} logic
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(trophy)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(trophy.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {trophy.description || 'Custom achievement trophy'}
              </p>
              <div className="space-y-1">
                {trophy.conditions.map((condition, index) => (
                  <div key={index} className="text-xs bg-muted p-1 rounded">
                    {getConditionDescription(condition)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customTrophies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No enhanced custom trophies created yet.</p>
          <p className="text-sm">Create trophies with multiple conditions and custom rewards!</p>
        </div>
      )}
    </div>
  );
}
