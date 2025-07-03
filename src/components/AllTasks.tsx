
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List } from 'lucide-react';

export function AllTasks() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <List className="h-6 w-6 text-orange-500" />
          All Tasks
        </h2>
        <p className="text-muted-foreground">
          View and manage all your tasks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            All your tasks will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
