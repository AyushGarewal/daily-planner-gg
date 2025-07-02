
import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTasks } from './useTasks';

interface SpinResult {
  type: 'xp' | 'item' | 'bonus';
  value: number | string;
  message: string;
}

export function useSpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastSpin, setLastSpin] = useLocalStorage<string | null>('lastSpin', null);
  const { addBonusXP, canUseDaily, markDailyUsed } = useTasks();
  const [userProgress, setUserProgress] = useLocalStorage<any>('userProgress', { totalXP: 0, level: 1 });

  const canSpin = () => {
    const today = new Date().toDateString();
    return lastSpin !== today && canUseDaily('spinUsed');
  };

  const spin = (): Promise<SpinResult> => {
    return new Promise((resolve) => {
      if (!canSpin() || isSpinning) {
        resolve({ type: 'xp', value: 0, message: 'Already spun today!' });
        return;
      }

      setIsSpinning(true);
      
      // Simulate spinning delay
      setTimeout(() => {
        const rewards = [
          { type: 'xp', value: 50, message: '+50 XP!' },
          { type: 'xp', value: 100, message: '+100 XP!' },
          { type: 'xp', value: 25, message: '+25 XP!' },
          { type: 'xp', value: 75, message: '+75 XP!' },
          { type: 'item', value: 'Streak Shield', message: 'Got Streak Shield!' },
          { type: 'bonus', value: 'Extra Spin', message: 'Free extra spin!' },
        ];

        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        
        // Apply the reward immediately
        if (randomReward.type === 'xp') {
          const xpAmount = randomReward.value as number;
          // Add XP directly to user progress
          setUserProgress(prev => ({
            ...prev,
            totalXP: prev.totalXP + xpAmount
          }));
        }

        // Mark spin as used
        const today = new Date().toDateString();
        setLastSpin(today);
        markDailyUsed('spinUsed');
        
        setIsSpinning(false);
        resolve(randomReward as SpinResult);
      }, 2000);
    });
  };

  return {
    canSpin: canSpin(),
    isSpinning,
    spin,
    lastSpin
  };
}
