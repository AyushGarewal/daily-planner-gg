
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Undo2 } from 'lucide-react';
import { UserProgress, getCurrentLevel, getXPRequiredForLevel, getXPForCurrentLevel, getXPForNextLevel } from '../types/task';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface XPBarProps {
  progress: UserProgress;
  className?: string;
}

interface XPTransaction {
  id: string;
  type: 'task' | 'habit' | 'side-habit' | 'negative-habit' | 'bonus';
  itemId: string;
  itemTitle: string;
  xpChange: number;
  timestamp: Date;
  canUndo: boolean;
}

export function XPBar({ progress, className = '' }: XPBarProps) {
  const [xpTransactions, setXPTransactions] = useLocalStorage<XPTransaction[]>('xp-transactions', []);
  
  const currentLevelXP = getXPForCurrentLevel(progress.totalXP);
  const nextLevelXPRequired = getXPForNextLevel(progress.totalXP);
  const levelProgress = nextLevelXPRequired > 0 ? (currentLevelXP / nextLevelXPRequired) * 100 : 100;
  const xpToNextLevel = nextLevelXPRequired - currentLevelXP;

  const recentTransactions = xpTransactions
    .filter(t => t.canUndo && new Date().getTime() - new Date(t.timestamp).getTime() < 24 * 60 * 60 * 1000) // Last 24 hours
    .slice(-10) // Show more recent transactions
    .reverse();

  const undoTransaction = (transactionId: string) => {
    const transaction = xpTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Mark transaction as undone
    setXPTransactions(prev => 
      prev.map(t => t.id === transactionId ? { ...t, canUndo: false } : t)
    );

    // Emit custom event for other components to handle undo
    const undoEvent = new CustomEvent('xp-undo', {
      detail: {
        transactionId,
        type: transaction.type,
        itemId: transaction.itemId,
        xpChange: transaction.xpChange
      }
    });
    window.dispatchEvent(undoEvent);
  };

  return (
    <div className={`bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-lg">Level {progress.level}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>{progress.totalXP} XP</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress to Level {progress.level + 1}</span>
          <span>{currentLevelXP}/{nextLevelXPRequired} XP</span>
        </div>
        <Progress value={levelProgress} className="h-3" />
        {xpToNextLevel > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            {xpToNextLevel} XP to next level
          </div>
        )}
      </div>

      {/* Recent XP Transactions with Undo */}
      {recentTransactions.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">Recent XP Changes</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between text-xs">
                <div className="flex-1">
                  <span className="text-muted-foreground">
                    {transaction.itemTitle}
                  </span>
                  <span className={`ml-2 font-medium ${transaction.xpChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.xpChange > 0 ? '+' : ''}{transaction.xpChange} XP
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({transaction.type})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => undoTransaction(transaction.id)}
                  className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                  title="Undo XP change"
                >
                  <Undo2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export function to add XP transactions
export const addXPTransaction = (
  type: XPTransaction['type'],
  itemId: string,
  itemTitle: string,
  xpChange: number
) => {
  const transaction: XPTransaction = {
    id: crypto.randomUUID(),
    type,
    itemId,
    itemTitle,
    xpChange,
    timestamp: new Date(),
    canUndo: true
  };

  // Get current transactions and add new one
  const currentTransactions = JSON.parse(localStorage.getItem('xp-transactions') || '[]');
  const updatedTransactions = [...currentTransactions, transaction];
  localStorage.setItem('xp-transactions', JSON.stringify(updatedTransactions));

  return transaction.id;
};
