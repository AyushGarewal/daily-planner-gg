
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export function Today() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6 text-blue-500" />
          Today's Tasks
        </h2>
        <p className="text-muted-foreground">
          Focus on what matters today
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your daily tasks will appear here. Start by adding some tasks to get organized!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
