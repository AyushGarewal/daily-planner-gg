
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles } from 'lucide-react';
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Gift className="h-6 w-6 text-purple-500" />
            Daily Spin Wheel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result ? (
            <>
              <div className="text-center">
                <div className={`w-48 h-48 mx-auto rounded-full border-8 border-purple-500 flex items-center justify-center ${
                  isSpinning ? 'animate-spin' : ''
                } bg-gradient-to-br from-purple-400 to-pink-500`}>
                  <Sparkles className="h-16 w-16 text-white" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Congratulations on completing all your tasks today!
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Possible Rewards:</h4>
                <div className="flex flex-wrap gap-2">
                  {SPIN_REWARDS.map((reward) => (
                    <Badge key={reward.id} variant="outline" className="text-xs">
                      {reward.title}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSpin} 
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSpinning ? 'Spinning...' : 'Spin Now!'}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold">You Won!</h3>
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                {result.title}
              </Badge>
              <Button onClick={handleClose} className="w-full">
                Claim Reward
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
