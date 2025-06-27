
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, X } from 'lucide-react';
import { SPIN_REWARDS } from '../data/achievements';
import { SpinReward, PowerUp } from '../types/achievements';

interface SpinWheelProps {
  onReward: (reward: SpinReward) => void;
  onClose: () => void;
}

export function SpinWheel({ onReward, onClose }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinReward | null>(null);

  const handleSpin = () => {
    setIsSpinning(true);
    
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
      onReward(selectedReward);
    }, 2000);
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                <div className={`w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-full border-8 border-purple-500 flex items-center justify-center ${
                  isSpinning ? 'animate-spin' : ''
                } bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg`}>
                  <Sparkles className="h-8 w-8 sm:h-16 sm:w-16 text-white" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  🎉 Congratulations on completing all your tasks today!
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-center">Possible Rewards:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {SPIN_REWARDS.map((reward) => (
                    <Badge key={reward.id} variant="outline" className="justify-center py-2 text-xs">
                      {reward.title}
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
              <div className="text-4xl sm:text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-xl font-bold">You Won!</h3>
              <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg">
                <Badge className="text-base sm:text-lg px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  {result.title}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your reward has been added to your account!
              </p>
              <Button onClick={handleClose} className="w-full min-h-[48px]">
                Awesome! Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
