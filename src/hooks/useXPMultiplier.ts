
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface XPMultiplierState {
  isActive: boolean;
  multiplier: number;
  expiresAt: number | null;
}

export function useXPMultiplier() {
  const [multiplierState, setMultiplierState] = useLocalStorage<XPMultiplierState>('xp-multiplier', {
    isActive: false,
    multiplier: 1,
    expiresAt: null
  });

  const [currentMultiplier, setCurrentMultiplier] = useState(1);

  useEffect(() => {
    const checkExpiration = () => {
      if (multiplierState.isActive && multiplierState.expiresAt) {
        const now = Date.now();
        if (now >= multiplierState.expiresAt) {
          // Multiplier has expired
          setMultiplierState({
            isActive: false,
            multiplier: 1,
            expiresAt: null
          });
          setCurrentMultiplier(1);
        } else {
          setCurrentMultiplier(multiplierState.multiplier);
        }
      } else {
        setCurrentMultiplier(1);
      }
    };

    // Check immediately
    checkExpiration();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiration, 60000);

    return () => clearInterval(interval);
  }, [multiplierState, setMultiplierState]);

  const activateMultiplier = (multiplier: number, durationHours: number = 1) => {
    const expiresAt = Date.now() + (durationHours * 60 * 60 * 1000);
    setMultiplierState({
      isActive: true,
      multiplier,
      expiresAt
    });
    setCurrentMultiplier(multiplier);
  };

  const applyMultiplier = (baseXP: number): number => {
    return Math.round(baseXP * currentMultiplier);
  };

  const getRemainingTime = (): number => {
    if (!multiplierState.isActive || !multiplierState.expiresAt) return 0;
    const remaining = Math.max(0, multiplierState.expiresAt - Date.now());
    return Math.ceil(remaining / (60 * 1000)); // Return minutes remaining
  };

  return {
    isActive: multiplierState.isActive,
    multiplier: currentMultiplier,
    activateMultiplier,
    applyMultiplier,
    getRemainingTime
  };
}
