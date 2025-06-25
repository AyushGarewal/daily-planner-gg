
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Star } from 'lucide-react';
import { PowerUp } from '../types/achievements';

interface PowerUpManagerProps {
  powerUps: PowerUp[];
  onUsePowerUp: (powerUpId: string) => void;
}

export function PowerUpManager({ powerUps, onUsePowerUp }: PowerUpManagerProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'auto-complete': return <Star className="h-5 w-5" />;
      case 'double-xp': return <Zap className="h-5 w-5" />;
      case 'streak-shield': return <Shield className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'auto-complete': return 'from-purple-500 to-pink-500';
      case 'double-xp': return 'from-yellow-500 to-orange-500';
      case 'streak-shield': return 'from-blue-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (powerUps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Power-Ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No power-ups available. Complete tasks and spin the wheel to earn them!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Power-Ups ({powerUps.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {powerUps.map((powerUp) => (
            <div 
              key={powerUp.id}
              className={`p-4 rounded-lg bg-gradient-to-r ${getColor(powerUp.type)} text-white`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(powerUp.type)}
                  <div>
                    <h4 className="font-medium">{powerUp.title}</h4>
                    <p className="text-sm opacity-90">{powerUp.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-2">
                    {powerUp.uses} left
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onUsePowerUp(powerUp.id)}
                    disabled={powerUp.uses === 0}
                  >
                    Use
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
