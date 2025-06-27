
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Edit, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CustomTrophy {
  id: string;
  name: string;
  icon: string;
  condition: {
    type: 'streak' | 'tasks_completed' | 'early_bird' | 'level_reached';
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}

interface CustomTrophyManagerProps {
  onTrophyCheck: (trophies: CustomTrophy[]) => CustomTrophy[];
}

const TROPHY_ICONS = ['🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💎', '👑', '🎯', '🔥', '⚡', '💪'];
const CONDITION_TYPES = [
  { value: 'streak', label: 'Reach streak of X days' },
  { value: 'tasks_completed', label: 'Complete X total tasks' },
  { value: 'early_bird', label: 'Complete X tasks before 9 AM' },
  { value: 'level_reached', label: 'Reach level X' },
];

export function CustomTrophyManager({ onTrophyCheck }: CustomTrophyManagerProps) {
  const [customTrophies, setCustomTrophies] = useLocalStorage<CustomTrophy[]>('customTrophies', []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTrophy, setEditingTrophy] = useState<CustomTrophy | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏆',
    conditionType: 'streak' as CustomTrophy['condition']['type'],
    conditionValue: 1
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '🏆',
      conditionType: 'streak',
      conditionValue: 1
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) return;

    const newTrophy: CustomTrophy = {
      id: crypto.randomUUID(),
      name: formData.name,
      icon: formData.icon,
      condition: {
        type: formData.conditionType,
        value: formData.conditionValue
      },
      unlocked: false
    };

    setCustomTrophies(prev => [...prev, newTrophy]);
    setIsCreating(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingTrophy || !formData.name.trim()) return;

    setCustomTrophies(prev => prev.map(trophy => 
      trophy.id === editingTrophy.id 
        ? {
            ...trophy,
            name: formData.name,
            icon: formData.icon,
            condition: {
              type: formData.conditionType,
              value: formData.conditionValue
            }
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
      icon: trophy.icon,
      conditionType: trophy.condition.type,
      conditionValue: trophy.condition.value
    });
  };

  const getConditionDescription = (condition: CustomTrophy['condition']) => {
    switch (condition.type) {
      case 'streak':
        return `Reach a ${condition.value} day streak`;
      case 'tasks_completed':
        return `Complete ${condition.value} total tasks`;
      case 'early_bird':
        return `Complete ${condition.value} tasks before 9 AM`;
      case 'level_reached':
        return `Reach level ${condition.value}`;
      default:
        return 'Unknown condition';
    }
  };

  const unlockedCount = customTrophies.filter(t => t.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Custom Trophies
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Trophy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Trophy Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter trophy name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Icon</label>
                <div className="grid grid-cols-6 gap-2 mt-2">
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

              <div>
                <label className="text-sm font-medium">Condition</label>
                <Select
                  value={formData.conditionType}
                  onValueChange={(value) => setFormData({ ...formData, conditionType: value as any })}
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
                <label className="text-sm font-medium">Target Value</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.conditionValue}
                  onChange={(e) => setFormData({ ...formData, conditionValue: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">Create</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTrophy} onOpenChange={(open) => !open && setEditingTrophy(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trophy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Trophy Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter trophy name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Icon</label>
              <div className="grid grid-cols-6 gap-2 mt-2">
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

            <div>
              <label className="text-sm font-medium">Condition</label>
              <Select
                value={formData.conditionType}
                onValueChange={(value) => setFormData({ ...formData, conditionType: value as any })}
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
              <label className="text-sm font-medium">Target Value</label>
              <Input
                type="number"
                min="1"
                value={formData.conditionValue}
                onChange={(e) => setFormData({ ...formData, conditionValue: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEdit} className="flex-1">Save</Button>
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
          <Card key={trophy.id} className={`${trophy.unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'opacity-60'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{trophy.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{trophy.name}</CardTitle>
                    {trophy.unlocked && trophy.unlockedAt && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Unlocked!
                      </Badge>
                    )}
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
              <p className="text-sm text-muted-foreground">
                {getConditionDescription(trophy.condition)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {customTrophies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No custom trophies created yet. Create your first trophy!</p>
        </div>
      )}
    </div>
  );
}
