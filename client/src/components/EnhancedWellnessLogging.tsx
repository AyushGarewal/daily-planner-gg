
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WaterCalorieTracker } from './WaterCalorieTracker';
import { MoodTracker } from './MoodTracker';
import { ChallengeSystem } from './ChallengeSystem';

export function EnhancedWellnessLogging() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="water-calories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="water-calories">Water & Calories</TabsTrigger>
          <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="water-calories">
          <WaterCalorieTracker />
        </TabsContent>
        
        <TabsContent value="mood">
          <MoodTracker />
        </TabsContent>
        
        <TabsContent value="challenges">
          <ChallengeSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}
