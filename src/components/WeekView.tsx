
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export function WeekView() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6 text-green-500" />
          Week View
        </h2>
        <p className="text-muted-foreground">
          Plan your week ahead
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your weekly overview will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
