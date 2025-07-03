
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export function Challenges() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Challenges
        </h2>
        <p className="text-muted-foreground">
          Take on challenges to level up
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your challenges will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
