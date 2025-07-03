
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export function Wellness() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Wellness
        </h2>
        <p className="text-muted-foreground">
          Track your health and wellbeing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wellness Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your wellness data will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
