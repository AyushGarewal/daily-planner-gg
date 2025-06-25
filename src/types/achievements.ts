
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (data: any) => boolean;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface PowerUp {
  id: string;
  title: string;
  description: string;
  icon: string;
  uses: number;
  maxUses: number;
  type: 'auto-complete' | 'double-xp' | 'streak-shield';
}

export interface SpinReward {
  id: string;
  title: string;
  type: 'xp' | 'power-up' | 'streak-shield';
  value: number | string;
  probability: number;
}

export interface UserStats {
  achievements: Achievement[];
  powerUps: PowerUp[];
  streakShields: number;
  totalTasksCompleted: number;
  earlyBirdCount: number;
  lastSpinDate?: Date;
  theme: string;
}
