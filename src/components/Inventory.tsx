
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Backpack, Zap, Shield, Star, Gift, Clock, CheckCircle } from 'lucide-react';
import { PowerUp, DailyUsage } from '../types/achievements';
import { AutoCompleteSelector } from './AutoCompleteSelector';
import { Task } from '../types/task';
import { useXPMultiplier } from '../hooks/useXPMultiplier';

interface InventoryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'xp-boost' | 'streak-shield' | 'auto-complete' | 'double-xp' | 'skip-token' | 'xp-multiplier';
  quantity: number;
  value?: number;
  dailyLimited?: boolean;
}

interface InventoryProps {
  powerUps: PowerUp[];
  streakShields: number;
  bonusXP: number;
  tasks: Task[];
  canUseDaily: (type: keyof DailyUsage) => boolean;
  onUsePowerUp: (powerUpId: string) => void;
  onUseStreakShield: () => void;
  onUseXPBoost: (amount: number) => void;
  onAutoCompleteTask: (taskId: string) => void;
  onRemoveBonusXP: () => void;
}

export function Inventory({ 
  powerUps, 
  streakShields, 
  bonusXP,
  tasks,
  canUseDaily,
  onUsePowerUp, 
  onUseStreakShield,
  onUseXPBoost,
  onAutoCompleteTask,
  onRemoveBonusXP
}: InventoryProps) {
  const [showAutoCompleteSelector, setShowAutoCompleteSelector] = useState(false);
  const { activateMultiplier } = useXPMultiplier();
  
  // Convert data to inventory items
  const inventoryItems: InventoryItem[] = [
    ...(bonusXP > 0 ? [{
      id: 'bonus-xp',
      title: 'XP Multiplier',
      description: `Apply 1.5x XP multiplier to your next task completion`,
      icon: '⚡',
      type: 'xp-multiplier' as const,
      quantity: 1,
      value: bonusXP
    }] : []),
    ...(streakShields > 0 ? [{
      id: 'streak-shield',
      title: 'Streak Shield',
      description: 'Protect your streak from breaking for one missed day',
      icon: '🛡️',
      type: 'streak-shield' as const,
      quantity: streakShields,
      dailyLimited: true
    }] : []),
    ...powerUps.map(powerUp => ({
      id: powerUp.id,
      title: powerUp.title,
      description: powerUp.description,
      icon: powerUp.icon,
      type: powerUp.type,
      quantity: powerUp.uses,
      dailyLimited: ['auto-complete', 'skip-token'].includes(powerUp.type)
    }))
  ];

  const handleUseItem = (item: InventoryItem) => {
    // Check daily usage limits
    if (item.dailyLimited) {
      const dailyType = item.type === 'streak-shield' ? 'streakShield' : 
                      item.type === 'auto-complete' ? 'autoComplete' : 
                      item.type === 'skip-token' ? 'skipToken' : null;
      
      if (dailyType && !canUseDaily(dailyType)) {
        return; // Already used today
      }
    }

    switch (item.type) {
      case 'xp-multiplier':
        // Activate 1.5x multiplier for 1 hour
        activateMultiplier(1.5, 1);
        // Remove the bonus XP item from inventory
        onRemoveBonusXP();
        break;
      case 'streak-shield':
        onUseStreakShield();
        break;
      case 'auto-complete':
        setShowAutoCompleteSelector(true);
        break;
      default:
        onUsePowerUp(item.id);
        break;
    }
  };

  const handleAutoCompleteSelect = (taskId: string) => {
    onAutoCompleteTask(taskId);
    setShowAutoCompleteSelector(false);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'xp-boost': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'streak-shield': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'auto-complete': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'xp-multiplier': return <Zap className="h-5 w-5 text-purple-500" />;
      case 'skip-token': return <Clock className="h-5 w-5 text-orange-500" />;
      default: return <Gift className="h-5 w-5 text-gray-500" />;
    }
  };

  const canUseItem = (item: InventoryItem): boolean => {
    if (!item.dailyLimited) return true;
    
    const dailyType = item.type === 'streak-shield' ? 'streakShield' : 
                    item.type === 'auto-complete' ? 'autoComplete' : 
                    item.type === 'skip-token' ? 'skipToken' : null;
    
    return dailyType ? canUseDaily(dailyType) : true;
  };

  const getUsageStatus = (item: InventoryItem): string | null => {
    if (!item.dailyLimited) return null;
    
    const dailyType = item.type === 'streak-shield' ? 'streakShield' : 
                    item.type === 'auto-complete' ? 'autoComplete' : 
                    item.type === 'skip-token' ? 'skipToken' : null;
    
    if (dailyType && !canUseDaily(dailyType)) {
      return 'Used Today';
    }
    return null;
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Backpack className="h-6 w-6 text-purple-500" />
            Inventory
          </h2>
          <p className="text-muted-foreground">
            Your collected rewards and power-ups
          </p>
        </div>

        {inventoryItems.length === 0 ? (
          <div className="text-center py-8">
            <Backpack className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Your inventory is empty
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete daily tasks and spin the wheel to earn rewards!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryItems.map((item) => {
              const canUse = canUseItem(item);
              const usageStatus = getUsageStatus(item);
              
              return (
                <Card 
                  key={item.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    !canUse ? 'opacity-60' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              Qty: {item.quantity}
                            </Badge>
                            {usageStatus && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                {usageStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {getItemIcon(item.type)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    
                    {item.dailyLimited && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        ⏰ Limited to once per day
                      </div>
                    )}
                    
                    {item.type === 'xp-multiplier' && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        🎯 Single use item - disappears after use
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleUseItem(item)}
                      className="w-full"
                      size="sm"
                      disabled={!canUse}
                      variant={canUse ? "default" : "secondary"}
                    >
                      {usageStatus || "Use Item"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AutoCompleteSelector
        isOpen={showAutoCompleteSelector}
        tasks={tasks}
        onSelect={handleAutoCompleteSelect}
        onClose={() => setShowAutoCompleteSelector(false)}
      />
    </>
  );
}
