
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '../types/achievements';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{achievement.icon}</span>
            <div>
              <Badge variant="secondary" className="mb-1 bg-white/20 text-white">
                Achievement Unlocked!
              </Badge>
              <h3 className="font-bold">{achievement.title}</h3>
              <p className="text-sm opacity-90">{achievement.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
