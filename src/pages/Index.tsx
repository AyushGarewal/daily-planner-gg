import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, List, BarChart3, Heart } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';
import { TaskCard } from '../components/TaskCard';
import { ProgressTracker } from '../components/ProgressTracker';
import { MoodTracker } from '../components/MoodTracker';
import { JournalPrompt } from '../components/JournalPrompt';
import { ProductivityChart } from '../components/ProductivityChart';
import { Task } from '../types/task';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const Index = () => {
  const { 
    tasks, 
    progress, 
    addTask, 
    updateTask, 
    deleteTask, 
    completeTask, 
    getTodaysTasks, 
    getTodayCompletionPercentage,
    shouldShowSurplusTasks,
    getVisibleTodaysTasks
  } = useTasks();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('today');

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    addTask(taskData);
    setIsFormOpen(false);
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const visibleTodaysTasks = getVisibleTodaysTasks();
  const todayCompletionPercentage = getTodayCompletionPercentage();

  // Get this week's days for weekly view
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return tasks.filter(task => new Date(task.dueDate).toDateString() === dateStr);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Task Planner</h1>
            <p className="text-muted-foreground">Stay productive and build great habits</p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <TaskForm
                onSubmit={handleAddTask}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Tracker */}
        <div className="mb-6">
          <ProgressTracker 
            progress={progress} 
            todayCompletionPercentage={todayCompletionPercentage} 
          />
        </div>

        {/* Task Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today" className="gap-2">
              <List className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </TabsTrigger>
            <TabsTrigger value="wellness" className="gap-2">
              <Heart className="h-4 w-4" />
              Wellness
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <List className="h-4 w-4" />
              All Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Today's Tasks ({visibleTodaysTasks.length})</h2>
                {shouldShowSurplusTasks() && (
                  <div className="text-sm text-purple-600 font-medium">
                    🎉 Surplus tasks unlocked!
                  </div>
                )}
              </div>
              
              {visibleTodaysTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks for today. Add some tasks to get started!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {visibleTodaysTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onEdit={setEditingTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="week" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">This Week</h2>
              <div className="grid gap-4">
                {weekDays.map((day) => {
                  const dayTasks = getTasksForDate(day);
                  const isToday = day.toDateString() === today.toDateString();
                  
                  return (
                    <div key={day.toISOString()} className={`p-4 rounded-lg border ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        {format(day, 'EEEE, MMM dd')}
                        {isToday && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Today</span>}
                        <span className="text-sm text-muted-foreground">({dayTasks.length} tasks)</span>
                      </h3>
                      
                      {dayTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tasks scheduled</p>
                      ) : (
                        <div className="space-y-2">
                          {dayTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onComplete={completeTask}
                              onEdit={setEditingTask}
                              onDelete={deleteTask}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wellness" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Wellness & Insights</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MoodTracker />
                <JournalPrompt />
              </div>
              
              <ProductivityChart />
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">All Tasks ({tasks.length})</h2>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks yet. Create your first task to get started!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tasks
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                        onEdit={setEditingTask}
                        onDelete={deleteTask}
                      />
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Task Dialog */}
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <TaskForm
                initialTask={editingTask}
                onSubmit={handleEditTask}
                onCancel={() => setEditingTask(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
