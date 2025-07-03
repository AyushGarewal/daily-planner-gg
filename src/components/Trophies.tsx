
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export function Trophies() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-gold-500" />
          Trophies
        </h2>
        <p className="text-muted-foreground">
          Your achievements and trophies
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievement Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your trophies will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
