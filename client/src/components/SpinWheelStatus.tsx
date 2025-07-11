
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Lock, CheckCircle, Clock } from 'lucide-react';

interface SpinWheelStatusProps {
  canSpin: boolean;
  todayCompletionPercentage: number;
  hasSpunToday: boolean;
}

export function SpinWheelStatus({ canSpin, todayCompletionPercentage, hasSpunToday }: SpinWheelStatusProps) {
  const getStatus = () => {
    if (hasSpunToday) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: "Daily spin completed",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    }
    
    if (canSpin) {
      return {
        icon: <Gift className="h-5 w-5 text-purple-500 animate-pulse" />,
        text: "Spin wheel available!",
        color: "bg-purple-100 text-purple-800 border-purple-200 animate-pulse"
      };
    }
    
    return {
      icon: <Lock className="h-5 w-5 text-gray-500" />,
      text: `Complete all tasks (${todayCompletionPercentage}%)`,
      color: "bg-gray-100 text-gray-600 border-gray-200"
    };
  };

  const status = getStatus();

  return (
    <Card className="border-2 transition-colors duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status.icon}
            <div>
              <p className="font-medium text-sm">Daily Spin Wheel</p>
              <p className="text-xs text-muted-foreground">Once per day reward</p>
            </div>
          </div>
          
          <Badge className={status.color}>
            {status.text}
          </Badge>
        </div>
        
        {!hasSpunToday && !canSpin && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Available after completing all daily tasks</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
