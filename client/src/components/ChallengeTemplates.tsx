
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Clock, Star, Zap, Target, Award, Gift, Calendar } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultDuration: number; // days
  defaultXP: number;
  suggestedHabits: string[];
  category: 'Health' | 'Productivity' | 'Learning' | 'Wellness' | 'Social';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const challengeTemplates: ChallengeTemplate[] = [
  {
    id: '7-day-fitness',
    title: '7-Day Fitness Kickstart',
    description: 'Build a consistent exercise habit with 7 days of physical activity',
    icon: <Trophy className="h-5 w-5" />,
    defaultDuration: 7,
    defaultXP: 200,
    suggestedHabits: ['Exercise', 'Morning walk', 'Yoga'],
    category: 'Health',
    difficulty: 'Easy'
  },
  {
    id: '21-day-meditation',
    title: '21-Day Mindfulness Journey',
    description: 'Develop inner peace with daily meditation practice',
    icon: <Star className="h-5 w-5" />,
    defaultDuration: 21,
    defaultXP: 350,
    suggestedHabits: ['Meditation', 'Deep breathing', 'Mindfulness'],
    category: 'Wellness',
    difficulty: 'Medium'
  },
  {
    id: '30-day-reading',
    title: '30-Day Reading Challenge',
    description: 'Expand your knowledge with daily reading sessions',
    icon: <Award className="h-5 w-5" />,
    defaultDuration: 30,
    defaultXP: 500,
    suggestedHabits: ['Reading', 'Study time', 'Learning'],
    category: 'Learning',
    difficulty: 'Medium'
  },
  {
    id: '14-day-productivity',
    title: '14-Day Productivity Boost',
    description: 'Maximize your daily output with focused work sessions',
    icon: <Zap className="h-5 w-5" />,
    defaultDuration: 14,
    defaultXP: 300,
    suggestedHabits: ['Deep work', 'Time blocking', 'Planning'],
    category: 'Productivity',
    difficulty: 'Hard'
  },
  {
    id: '10-day-gratitude',
    title: '10-Day Gratitude Practice',
    description: 'Cultivate positivity with daily gratitude reflection',
    icon: <Gift className="h-5 w-5" />,
    defaultDuration: 10,
    defaultXP: 250,
    suggestedHabits: ['Gratitude journal', 'Reflection', 'Positive thinking'],
    category: 'Wellness',
    difficulty: 'Easy'
  },
  {
    id: '5-day-early-riser',
    title: '5-Day Early Riser',
    description: 'Transform your mornings by waking up early consistently',
    icon: <Clock className="h-5 w-5" />,
    defaultDuration: 5,
    defaultXP: 150,
    suggestedHabits: ['Wake up early', 'Morning routine', 'Evening preparation'],
    category: 'Productivity',
    difficulty: 'Hard'
  },
  {
    id: '28-day-hydration',
    title: '28-Day Hydration Challenge',
    description: 'Stay healthy and energized with proper daily hydration',
    icon: <Target className="h-5 w-5" />,
    defaultDuration: 28,
    defaultXP: 400,
    suggestedHabits: ['Drink water', 'Track hydration', 'Healthy habits'],
    category: 'Health',
    difficulty: 'Easy'
  }
];

interface CustomChallengeFormProps {
  template: ChallengeTemplate;
  onClose: () => void;
  onSubmit: (challenge: any) => void;
}

function CustomChallengeForm({ template, onClose, onSubmit }: CustomChallengeFormProps) {
  const { tasks } = useTasks();
  const [duration, setDuration] = useState(template.defaultDuration);
  const [xpReward, setXpReward] = useState(template.defaultXP);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<string>('');

  const availableHabits = tasks.filter(task => task.type === 'habit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const challenge = {
      id: `challenge_${Date.now()}`,
      templateId: template.id,
      title: template.title,
      description: template.description,
      duration,
      xpReward,
      selectedHabits,
      deadline: deadline ? new Date(deadline) : undefined,
      startDate: new Date(),
      isActive: true,
      progress: 0,
      category: template.category,
      difficulty: template.difficulty
    };

    onSubmit(challenge);
    onClose();
  };

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          {template.icon}
        </div>
        <h3 className="text-lg font-semibold">{template.title}</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (days)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="365"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="xpReward">XP Reward</Label>
          <Input
            id="xpReward"
            type="number"
            min="50"
            max="1000"
            value={xpReward}
            onChange={(e) => setXpReward(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (Optional)</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <Label>Select Habits to Include</Label>
        <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-3">
          {availableHabits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No habits available. Create some habits first!</p>
          ) : (
            availableHabits.map(habit => (
              <div key={habit.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedHabits.includes(habit.id)}
                  onChange={() => toggleHabitSelection(habit.id)}
                  className="rounded"
                />
                <span className="text-sm">{habit.title}</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {habit.xpValue} XP
                </Badge>
              </div>
            ))
          )}
        </div>
        
        {selectedHabits.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedHabits.length} habit{selectedHabits.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={selectedHabits.length === 0}>
          Start Challenge
        </Button>
      </div>
    </form>
  );
}

export function ChallengeTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(null);
  const [activeDialogOpen, setActiveDialogOpen] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Health': return 'bg-green-100 text-green-800';
      case 'Productivity': return 'bg-blue-100 text-blue-800';
      case 'Learning': return 'bg-purple-100 text-purple-800';
      case 'Wellness': return 'bg-pink-100 text-pink-800';
      case 'Social': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleStartChallenge = (challenge: any) => {
    setActiveChallenges(prev => [...prev, challenge]);
    // In a real app, you'd save this to localStorage or database
    localStorage.setItem('activeChallenges', JSON.stringify([...activeChallenges, challenge]));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Challenge Templates</h2>
        <p className="text-muted-foreground">
          Choose from our curated challenges to build better habits and achieve your goals
        </p>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Challenges</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeChallenges.map(challenge => (
              <Card key={challenge.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{challenge.duration} days</span>
                      <span>{challenge.xpReward} XP reward</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Challenge Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Templates</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challengeTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{template.defaultDuration} days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{template.defaultXP} XP</span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Start Challenge
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Customize Your Challenge</DialogTitle>
                    </DialogHeader>
                    {selectedTemplate && (
                      <CustomChallengeForm
                        template={selectedTemplate}
                        onClose={() => setSelectedTemplate(null)}
                        onSubmit={handleStartChallenge}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
