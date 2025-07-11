
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Sparkles, Star } from 'lucide-react';

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete: () => void;
}

export function LevelUpAnimation({ newLevel, onComplete }: LevelUpAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="max-w-md mx-4 overflow-hidden animate-scale-in">
        <CardContent className="p-8 text-center bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 dark:from-yellow-900 dark:via-orange-900 dark:to-pink-900">
          {/* Confetti effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                {Math.random() > 0.5 ? (
                  <Star className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Sparkles className="h-3 w-3 text-pink-500" />
                )}
              </div>
            ))}
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="animate-bounce">
              <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 animate-pulse">
                LEVEL UP!
              </h2>
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse">
                {newLevel}
              </div>
              <p className="text-lg text-muted-foreground">
                🎉 You've reached Level {newLevel}! 🎉
              </p>
            </div>
            
            <div className="flex justify-center space-x-2 mt-6">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-6 w-6 animate-pulse ${
                    i < 3 ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
