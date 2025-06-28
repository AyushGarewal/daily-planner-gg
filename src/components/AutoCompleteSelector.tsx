
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, X } from 'lucide-react';
import { Task } from '../types/task';

interface AutoCompleteSelectorProps {
  isOpen: boolean;
  tasks: Task[];
  onSelect: (taskId: string) => void;
  onClose: () => void;
}

export function AutoCompleteSelector({ isOpen, tasks, onSelect, onClose }: AutoCompleteSelectorProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  
  const incompleteTasks = tasks.filter(task => !task.completed);

  const handleConfirm = () => {
    if (selectedTask) {
      onSelect(selectedTask);
      setSelectedTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Select Task to Auto-Complete
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose which task you'd like to automatically complete using your Auto-Complete token.
          </p>
          
          {incompleteTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>All tasks are already completed!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {incompleteTasks.map((task) => (
                <Card 
                  key={task.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTask === task.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTask(task.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium line-clamp-2">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.xpValue} XP
                          </Badge>
                        </div>
                      </div>
                      
                      {selectedTask === task.id && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedTask}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Auto-Complete Selected Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
