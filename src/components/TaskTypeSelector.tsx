
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Repeat, Calendar, BarChart3 } from 'lucide-react';

interface TaskTypeSelectorProps {
  selectedType: 'task' | 'habit';
  onTypeSelect: (type: 'task' | 'habit') => void;
}

export function TaskTypeSelector({ selectedType, onTypeSelect }: TaskTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">What would you like to create?</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === 'task' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => onTypeSelect('task')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-500" />
              Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              One-time action to complete
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">One-time</Badge>
              <Badge variant="secondary" className="text-xs">No tracking</Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === 'habit' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => onTypeSelect('habit')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="h-5 w-5 text-green-500" />
              Habit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Recurring activity with performance tracking
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Recurring
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Tracked
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
