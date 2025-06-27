
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface SpinWheelCenterProps {
  canSpin: () => boolean;
  todayCompletionPercentage: number;
  onSpin: () => void;
}

export function SpinWheelCenter({ canSpin, todayCompletionPercentage, onSpin }: SpinWheelCenterProps) {
  const canSpinToday = canSpin();
  const isEligible = todayCompletionPercentage === 100;
  const hasSpunToday = !canSpinToday && isEligible;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Daily Spin Wheel</h2>
        <p className="text-muted-foreground">Complete all your daily tasks to unlock your spin!</p>
      </div>

      {/* Main Spin Card */}
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2">
            <Gift className="h-6 w-6 text-purple-500" />
            Spin for Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Daily Tasks Progress</span>
              <span className="font-medium">{todayCompletionPercentage}%</span>
            </div>
            <Progress 
              value={todayCompletionPercentage} 
              className="h-3"
            />
            
            {todayCompletionPercentage < 100 && (
              <p className="text-sm text-muted-foreground text-center">
                Complete {100 - todayCompletionPercentage}% more tasks to unlock spin
              </p>
            )}
          </div>

          {/* Spin Button */}
          <div className="text-center">
            {hasSpunToday ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Already spun today!</span>
                </div>
                <p className="text-sm text-muted-foreground">Come back tomorrow for another spin</p>
              </div>
            ) : isEligible ? (
              <div className="space-y-3">
                <Button 
                  onClick={onSpin}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 animate-pulse"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Spin Now!
                </Button>
                <p className="text-sm text-green-600 font-medium">🎉 Congratulations! You've earned a spin!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  disabled
                  size="lg"
                  className="w-full"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Complete Tasks to Unlock
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Preview */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Possible Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-lg text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium">Bonus XP</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-sm font-medium">Streak Shield</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg text-center">
              <div className="text-2xl mb-2">⏭️</div>
              <div className="text-sm font-medium">Skip Token</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg text-center">
              <div className="text-2xl mb-2">✨</div>
              <div className="text-sm font-medium">Power-Up</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="max-w-lg mx-auto bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How it works:</p>
            <ul className="space-y-1 list-disc list-inside ml-2">
              <li>Complete 100% of your daily tasks</li>
              <li>Return here to spin the wheel</li>
              <li>Earn rewards to boost your productivity</li>
              <li>One spin per day maximum</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
