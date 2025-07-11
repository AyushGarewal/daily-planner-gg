import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Plus, 
  Target, 
  Calendar, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Clock,
  Star,
  Award
} from 'lucide-react';
import { useChallengeSystem, Challenge, ChallengeType, HabitType } from '../hooks/useChallengeSystem';
import { format } from 'date-fns';

interface ChallengeFormData {
  title: string;
  description: string;
  challengeType: ChallengeType;
  linkedHabits: string[];
  habitTypes: HabitType[];
  targetValue: number;
  timeLimit: number;
  xpReward: number;
  badgeReward: string;
}

const challengeTypeOptions = [
  { value: 'streak', label: 'Streak Challenge', icon: <Zap className="h-4 w-4" />, description: 'Complete habits for consecutive days' },
  { value: 'frequency', label: 'Frequency Challenge', icon: <Target className="h-4 w-4" />, description: 'Complete habits a certain number of times' },
  { value: 'milestone', label: 'Milestone Challenge', icon: <TrendingUp className="h-4 w-4" />, description: 'Reach a numeric progress target' },
  { value: 'avoidance', label: 'Avoidance Challenge', icon: <Shield className="h-4 w-4" />, description: 'Avoid negative habits continuously' },
  { value: 'completion', label: 'Completion Challenge', icon: <CheckCircle className="h-4 w-4" />, description: 'Maintain daily task completion rate' },
  { value: 'combo', label: 'Combo Challenge', icon: <Users className="h-4 w-4" />, description: 'Complete multiple habits on the same day' }
];

function ChallengeForm({ onSubmit, onCancel }: { onSubmit: (data: ChallengeFormData) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<ChallengeFormData>({
    title: '',
    description: '',
    challengeType: 'streak',
    linkedHabits: [],
    habitTypes: [],
    targetValue: 7,
    timeLimit: 30,
    xpReward: 100,
    badgeReward: ''
  });

  const { getAvailableHabits } = useChallengeSystem();
  const availableHabits = getAvailableHabits();

  const handleHabitToggle = (habitId: string, habitType: HabitType) => {
    const isSelected = formData.linkedHabits.includes(habitId);
    
    if (isSelected) {
      const index = formData.linkedHabits.indexOf(habitId);
      setFormData(prev => ({
        ...prev,
        linkedHabits: prev.linkedHabits.filter(id => id !== habitId),
        habitTypes: prev.habitTypes.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        linkedHabits: [...prev.linkedHabits, habitId],
        habitTypes: [...prev.habitTypes, habitType]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.linkedHabits.length === 0) return;
    
    onSubmit(formData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      challengeType: 'streak',
      linkedHabits: [],
      habitTypes: [],
      targetValue: 7,
      timeLimit: 30,
      xpReward: 100,
      badgeReward: ''
    });
  };

  const selectedChallengeType = challengeTypeOptions.find(option => option.value === formData.challengeType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Challenge Name</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter challenge name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your challenge"
          />
        </div>

        <div>
          <Label>Challenge Type</Label>
          <Select value={formData.challengeType} onValueChange={(value: ChallengeType) => setFormData(prev => ({ ...prev, challengeType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {challengeTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Select Habits to Link</Label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {availableHabits.map(habit => (
              <div key={habit.id} className="flex items-center space-x-2">
                <Checkbox
                  id={habit.id}
                  checked={formData.linkedHabits.includes(habit.id)}
                  onCheckedChange={() => handleHabitToggle(habit.id, habit.type)}
                />
                <Label htmlFor={habit.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>{habit.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {habit.type}
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </div>
          {formData.linkedHabits.length === 0 && (
            <p className="text-sm text-red-500 mt-1">Please select at least one habit</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="targetValue">
              Target {selectedChallengeType?.value === 'streak' ? 'Days' : 
                    selectedChallengeType?.value === 'frequency' ? 'Count' :
                    selectedChallengeType?.value === 'completion' ? 'Percentage' : 'Value'}
            </Label>
            <Input
              id="targetValue"
              type="number"
              value={formData.targetValue}
              onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="timeLimit">Time Limit (Days)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
              min="1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="xpReward">XP Reward</Label>
            <Input
              id="xpReward"
              type="number"
              value={formData.xpReward}
              onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="badgeReward">Badge Name (Optional)</Label>
            <Input
              id="badgeReward"
              value={formData.badgeReward}
              onChange={(e) => setFormData(prev => ({ ...prev, badgeReward: e.target.value }))}
              placeholder="Achievement badge"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!formData.title.trim() || formData.linkedHabits.length === 0}>
          Create Challenge
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { retryChallenge } = useChallengeSystem();
  
  const getChallengeTypeIcon = (type: ChallengeType) => {
    const option = challengeTypeOptions.find(opt => opt.value === type);
    return option?.icon || <Target className="h-4 w-4" />;
  };

  const getProgressPercentage = () => {
    if (challenge.targetValue === 0) return 0;
    return Math.min((challenge.currentProgress / challenge.targetValue) * 100, 100);
  };

  const getStatusColor = () => {
    if (challenge.isCompleted) return 'text-green-600';
    if (challenge.isFailed) return 'text-red-600';
    return 'text-blue-600';
  };

  const getStatusIcon = () => {
    if (challenge.isCompleted) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (challenge.isFailed) return <XCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getChallengeTypeIcon(challenge.challengeType)}
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <Badge variant={challenge.isCompleted ? 'default' : challenge.isFailed ? 'destructive' : 'secondary'}>
              {challenge.isCompleted ? 'Completed' : challenge.isFailed ? 'Failed' : 'Active'}
            </Badge>
          </div>
        </div>
        {challenge.description && (
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className={getStatusColor()}>
              {challenge.currentProgress} / {challenge.targetValue}
              {challenge.challengeType === 'completion' ? '%' : ''}
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Time Remaining:</span>
            <div className="font-medium">
              {challenge.isCompleted || challenge.isFailed ? 
                'Finished' : 
                `${daysRemaining} days`
              }
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">XP Reward:</span>
            <div className="font-medium flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              {challenge.xpReward}
            </div>
          </div>
        </div>

        {challenge.badgeReward && (
          <div className="text-sm">
            <span className="text-muted-foreground">Badge:</span>
            <Badge variant="outline" className="ml-2">
              <Award className="h-3 w-3 mr-1" />
              {challenge.badgeReward}
            </Badge>
          </div>
        )}

        <div className="text-sm">
          <span className="text-muted-foreground">Linked Habits:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {challenge.linkedHabits.map((habitId, index) => (
              <Badge key={habitId} variant="outline" className="text-xs">
                {habitId.slice(0, 8)}... ({challenge.habitTypes[index]})
              </Badge>
            ))}
          </div>
        </div>

        {challenge.isFailed && (
          <Button 
            onClick={() => retryChallenge(challenge.id)} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Challenge
          </Button>
        )}
        
        {challenge.isCompleted && challenge.completedAt && (
          <div className="text-sm text-muted-foreground">
            Completed on {format(new Date(challenge.completedAt), 'MMM dd, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ComprehensiveChallengeSystem() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { 
    activeChallenges, 
    completedChallenges, 
    failedChallenges, 
    createChallenge 
  } = useChallengeSystem();

  const handleCreateChallenge = (formData: ChallengeFormData) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + formData.timeLimit);

    createChallenge({
      ...formData,
      startDate: new Date(),
      endDate
    });
    
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Challenge System</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <ChallengeForm 
              onSubmit={handleCreateChallenge}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({failedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeChallenges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first challenge to start tracking your progress!
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Challenge
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Completed Challenges</h3>
                <p className="text-muted-foreground">
                  Complete challenges to see them here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          {failedChallenges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Failed Challenges</h3>
                <p className="text-muted-foreground">
                  Keep up the good work!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {failedChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}