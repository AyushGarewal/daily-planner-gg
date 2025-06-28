
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Backpack, Zap, Shield, Star, Gift } from 'lucide-react';
import { PowerUp } from '../types/achievements';

interface InventoryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'xp-boost' | 'streak-shield' | 'auto-complete' | 'double-xp' | 'skip-token';
  quantity: number;
  value?: number;
}

interface InventoryProps {
  powerUps: PowerUp[];
  streakShields: number;
  bonusXP: number;
  onUsePowerUp: (powerUpId: string) => void;
  onUseStreakShield: () => void;
  onUseXPBoost: (amount: number) => void;
}

export function Inventory({ 
  powerUps, 
  streakShields, 
  bonusXP, 
  onUsePowerUp, 
  onUseStreakShield,
  onUseXPBoost 
}: InventoryProps) {
  // Convert data to inventory items
  const inventoryItems: InventoryItem[] = [
    ...(bonusXP > 0 ? [{
      id: 'bonus-xp',
      title: 'Bonus XP',
      description: `Instantly add ${bonusXP} XP to your progress`,
      icon: '⭐',
      type: 'xp-boost' as const,
      quantity: 1,
      value: bonusXP
    }] : []),
    ...(streakShields > 0 ? [{
      id: 'streak-shield',
      title: 'Streak Shield',
      description: 'Protect your streak from breaking for one missed day',
      icon: '🛡️',
      type: 'streak-shield' as const,
      quantity: streakShields
    }] : []),
    ...powerUps.map(powerUp => ({
      id: powerUp.id,
      title: powerUp.title,
      description: powerUp.description,
      icon: powerUp.icon,
      type: powerUp.type,
      quantity: powerUp.uses
    }))
  ];

  const handleUseItem = (item: InventoryItem) => {
    switch (item.type) {
      case 'xp-boost':
        if (item.value) {
          onUseXPBoost(item.value);
        }
        break;
      case 'streak-shield':
        onUseStreakShield();
        break;
      default:
        onUsePowerUp(item.id);
        break;
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'xp-boost': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'streak-shield': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'auto-complete': 
      case 'double-xp': 
      case 'skip-token': return <Zap className="h-5 w-5 text-purple-500" />;
      default: return <Gift className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
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
          {inventoryItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Qty: {item.quantity}
                      </Badge>
                    </div>
                  </div>
                  {getItemIcon(item.type)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                
                <Button
                  onClick={() => handleUseItem(item)}
                  className="w-full"
                  size="sm"
                >
                  Use Item
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
