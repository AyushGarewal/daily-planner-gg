
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BookOpen, 
  Target, 
  CheckSquare, 
  TrendingUp, 
  Plus, 
  Calendar,
  Trophy,
  Heart,
  Zap,
  Trash2,
  Edit
} from 'lucide-react';
import { Goal } from '../types/goals';
import { useGoals } from '../hooks/useGoals';
import { format } from 'date-fns';
import { GoalForm } from './GoalForm';

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
}

export function GoalDetail({ goal, onClose }: GoalDetailProps) {
  const {
    getGoalProgress,
    getMilestonesForGoal,
    getSubtasksForMilestone,
    getJournalEntriesForGoal,
    addJournalEntry,
    addMilestone,
    addSubtask,
    updateMilestone,
    updateSubtask,
    updateGoal,
    deleteGoal
  } = useGoals();

  const [activeTab, setActiveTab] = useState('overview');
  const [journalContent, setJournalContent] = useState('');
  const [mood, setMood] = useState([3]);
  const [motivation, setMotivation] = useState([3]);
  const [newMilestone, setNewMilestone] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const progress = getGoalProgress(goal.id);
  const milestones = getMilestonesForGoal(goal.id);
  const journalEntries = getJournalEntriesForGoal(goal.id);

  const handleAddJournalEntry = () => {
    if (journalContent.trim()) {
      addJournalEntry({
        goalId: goal.id,
        content: journalContent,
        mood: mood[0],
        motivation: motivation[0]
      });
      setJournalContent('');
      setMood([3]);
      setMotivation([3]);
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      addMilestone({
        goalId: goal.id,
        title: newMilestone
      });
      setNewMilestone('');
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim() && selectedMilestone) {
      addSubtask({
        milestoneId: selectedMilestone,
        title: newSubtask
      });
      setNewSubtask('');
    }
  };

  const handleCompleteGoal = () => {
    updateGoal(goal.id, { isCompleted: true });
    // You could add a celebration animation here
    setTimeout(() => {
      alert('🎉 Congratulations! You\'ve completed your goal!');
    }, 100);
  };

  const handleDeleteGoal = () => {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      deleteGoal(goal.id);
      onClose();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career': return 'bg-blue-500';
      case 'Personal': return 'bg-green-500';
      case 'Health': return 'bg-red-500';
      case 'Education': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {isEditing ? (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <GoalForm 
              initialGoal={goal} 
              onClose={() => setIsEditing(false)} 
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${getCategoryColor(goal.category)}`} />
                  <Badge variant="secondary">{goal.category}</Badge>
                  {goal.isCompleted && (
                    <Badge className="bg-green-500">Completed</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteGoal}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogTitle className="text-2xl">{goal.title}</DialogTitle>
              <p className="text-muted-foreground">{goal.description}</p>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="gap-2">
                  <Target className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="journal" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Journal
                </TabsTrigger>
                <TabsTrigger value="milestones" className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Milestones
                </TabsTrigger>
                <TabsTrigger value="progress" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Progress
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Goal Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Started: {format(new Date(goal.startDate), 'MMM dd, yyyy')}</span>
                      </div>
                      {goal.targetDate && (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm">{progress.percentage}%</span>
                      </div>
                      <Progress value={progress.percentage} className="h-3" />
                      <p className="text-xs text-muted-foreground">
                        {progress.completedSubtasks} of {progress.totalSubtasks} tasks completed
                      </p>
                    </div>

                    {!goal.isCompleted && progress.percentage === 100 && (
                      <Button onClick={handleCompleteGoal} className="w-full gap-2">
                        <Trophy className="h-4 w-4" />
                        Mark Goal as Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="journal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Journal Entry</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Write about your progress, challenges, or reflections..."
                      value={journalContent}
                      onChange={(e) => setJournalContent(e.target.value)}
                      rows={4}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mood (1-5): {mood[0]}</Label>
                        <div className="flex items-center gap-2">
                          <span>😢</span>
                          <Slider
                            value={mood}
                            onValueChange={setMood}
                            max={5}
                            min={1}
                            step={1}
                            className="flex-1"
                          />
                          <span>😊</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Motivation (1-5): {motivation[0]}</Label>
                        <div className="flex items-center gap-2">
                          <span>🔋</span>
                          <Slider
                            value={motivation}
                            onValueChange={setMotivation}
                            max={5}
                            min={1}
                            step={1}
                            className="flex-1"
                          />
                          <span>⚡</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleAddJournalEntry} disabled={!journalContent.trim()}>
                      Add Entry
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {journalEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.createdAt), 'MMM dd, yyyy at HH:mm')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span className="text-xs">{entry.mood}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span className="text-xs">{entry.motivation}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{entry.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {journalEntries.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No journal entries yet. Start documenting your journey!
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Milestone</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Start a blog"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                      />
                      <Button onClick={handleAddMilestone} disabled={!newMilestone.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {milestones.map((milestone) => {
                    const subtasks = getSubtasksForMilestone(milestone.id);
                    const completedSubtasks = subtasks.filter(s => s.isCompleted).length;
                    const milestoneProgress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

                    return (
                      <Card key={milestone.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={milestone.isCompleted}
                                onCheckedChange={(checked) => 
                                  updateMilestone(milestone.id, { isCompleted: checked as boolean })
                                }
                              />
                              <CardTitle className={`text-lg ${milestone.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {milestone.title}
                              </CardTitle>
                            </div>
                            {milestone.isCompleted && (
                              <Badge className="bg-green-500">Complete</Badge>
                            )}
                          </div>
                          {subtasks.length > 0 && (
                            <div className="space-y-1">
                              <Progress value={milestoneProgress} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {completedSubtasks} of {subtasks.length} subtasks completed
                              </p>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add subtask..."
                                value={selectedMilestone === milestone.id ? newSubtask : ''}
                                onChange={(e) => {
                                  setNewSubtask(e.target.value);
                                  setSelectedMilestone(milestone.id);
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && selectedMilestone === milestone.id) {
                                    handleAddSubtask();
                                  }
                                }}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedMilestone(milestone.id);
                                  handleAddSubtask();
                                }}
                                disabled={!newSubtask.trim() || selectedMilestone !== milestone.id}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {subtasks.length > 0 && (
                              <div className="space-y-2">
                                {subtasks.map((subtask) => (
                                  <div key={subtask.id} className="flex items-center gap-2">
                                    <Checkbox
                                      checked={subtask.isCompleted}
                                      onCheckedChange={(checked) => 
                                        updateSubtask(subtask.id, { isCompleted: checked as boolean })
                                      }
                                    />
                                    <span className={`text-sm ${subtask.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                      {subtask.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {milestones.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No milestones yet. Add your first milestone to break down your goal!
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">{progress.percentage}%</div>
                        <p className="text-muted-foreground">Overall Completion</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-semibold">{milestones.length}</div>
                          <p className="text-sm text-muted-foreground">Milestones</p>
                        </div>
                        <div>
                          <div className="text-2xl font-semibold">{progress.totalSubtasks}</div>
                          <p className="text-sm text-muted-foreground">Total Tasks</p>
                        </div>
                        <div>
                          <div className="text-2xl font-semibold">{journalEntries.length}</div>
                          <p className="text-sm text-muted-foreground">Journal Entries</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
