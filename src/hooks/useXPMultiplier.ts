
import { useLocalStorage } from './useLocalStorage';

interface XPMultiplier {
  active: boolean;
  multiplier: number;
  startTime: number;
  duration: number; // in milliseconds
}

export function useXPMultiplier() {
  const [xpMultiplier, setXPMultiplier] = useLocalStorage<XPMultiplier>('xpMultiplier', {
    active: false,
    multiplier: 1,
    startTime: 0,
    duration: 0
  });

  const activateMultiplier = (multiplier: number, durationInHours: number) => {
    setXPMultiplier({
      active: true,
      multiplier,
      startTime: Date.now(),
      duration: durationInHours * 60 * 60 * 1000
    });
  };

  const getActiveMultiplier = (): number => {
    if (!xpMultiplier.active) return 1;
    
    const now = Date.now();
    const elapsed = now - xpMultiplier.startTime;
    
    if (elapsed >= xpMultiplier.duration) {
      // Multiplier has expired
      setXPMultiplier({
        active: false,
        multiplier: 1,
        startTime: 0,
        duration: 0
      });
      return 1;
    }
    
    return xpMultiplier.multiplier;
  };

  const getRemainingTime = (): number => {
    if (!xpMultiplier.active) return 0;
    
    const now = Date.now();
    const elapsed = now - xpMultiplier.startTime;
    const remaining = xpMultiplier.duration - elapsed;
    
    return Math.max(0, remaining);
  };

  const isActive = (): boolean => {
    return xpMultiplier.active && getRemainingTime() > 0;
  };

  return {
    activateMultiplier,
    getActiveMultiplier,
    getRemainingTime,
    isActive,
    currentMultiplier: xpMultiplier.multiplier
  };
}
