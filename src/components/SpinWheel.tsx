
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, X, Trophy, Star } from 'lucide-react';
import { SPIN_REWARDS } from '../data/achievements';
import { SpinReward } from '../types/achievements';
import { useXPMultiplier } from '../hooks/useXPMultiplier';

interface SpinWheelProps {
  onReward: (reward: SpinReward) => void;
  onClose: () => void;
}

export function SpinWheel({ onReward, onClose }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinReward | null>(null);
  const [spinRotation, setSpinRotation] = useState(0);
  const { activateMultiplier } = useXPMultiplier();

  const handleSpin = () => {
    setIsSpinning(true);
    
    // Generate multiple rotations plus random final position
    const baseRotations = 5;
    const randomRotation = Math.random() * 360;
    const totalRotation = spinRotation + (baseRotations * 360) + randomRotation;
    setSpinRotation(totalRotation);
    
    // Calculate weighted random selection
    const totalProbability = SPIN_REWARDS.reduce((sum, reward) => sum + reward.probability, 0);
    let random = Math.random() * totalProbability;
    
    let selectedReward = SPIN_REWARDS[0];
    for (const reward of SPIN_REWARDS) {
      random -= reward.probability;
      if (random <= 0) {
        selectedReward = reward;
        break;
      }
    }

    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedReward);
      
      // Handle XP multiplier reward - Fixed: Now properly gives 1.5x multiplier
      if (selectedReward.type === 'xp-multiplier') {
        activateMultiplier(1.5, 1); // 1.5x multiplier for 1 hour
      }
      
      onReward(selectedReward);
    }, 3000);
  };

  const handleClose = () => {
    setResult(null);
    setSpinRotation(0);
    onClose();
  };

  const getRewardIcon = (reward: SpinReward) => {
    switch (reward.type) {
      case 'xp': return '⭐';
      case 'power-up': return '⚡';
      case 'streak-shield': return '🛡️';
      case 'xp-multiplier': return '🔥';
      default: return '🎁';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="absolute right-2 top-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Gift className="h-6 w-6 text-purple-500" />
            Daily Spin Wheel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result ? (
            <>
              <div className="text-center">
                <div className="relative mx-auto w-48 h-48">
                  <div className="absolute inset-0 rounded-full border-8 border-purple-500 bg-gradient-conic from-purple-400 via-pink-500 via-blue-500 via-green-500 to-purple-400 shadow-lg"></div>
                  
                  <div 
                    className={`absolute inset-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center transition-transform duration-3000 ease-out ${
                      isSpinning ? 'animate-spin' : ''
                    }`}
                    style={{ 
                      transform: `rotate(${spinRotation}deg)`,
                      transitionDuration: isSpinning ? '3s' : '0.3s'
                    }}
                  >
                    <Sparkles className="h-8 w-8 text-purple-500" />
                  </div>
                  
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  🎉 Congratulations on completing all your tasks today!
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-center">Possible Rewards:</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {SPIN_REWARDS.map((reward) => (
                    <Badge key={reward.id} variant="outline" className="justify-center py-2 text-xs">
                      {getRewardIcon(reward)} {reward.title}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSpin} 
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[48px] text-white font-semibold"
              >
                {isSpinning ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Spinning...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Spin Now!
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <Trophy className="h-12 w-12 mx-auto text-yellow-500 animate-pulse" />
              <h3 className="text-2xl font-bold">You Won!</h3>
              
              <div className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border-2 border-yellow-300 dark:border-yellow-600">
                <div className="text-4xl mb-2">{getRewardIcon(result)}</div>
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  {result.title}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.description}
                </p>
              </div>
              
              <Button onClick={handleClose} className="w-full">
                Collect Reward
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
