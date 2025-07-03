
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

export function Projects() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FolderOpen className="h-6 w-6 text-indigo-500" />
          Projects
        </h2>
        <p className="text-muted-foreground">
          Organize your work into projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your projects will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
