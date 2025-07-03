
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export function Routines() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Clock className="h-6 w-6 text-blue-600" />
          Routines
        </h2>
        <p className="text-muted-foreground">
          Build and maintain healthy routines
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Routines</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your routines will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
