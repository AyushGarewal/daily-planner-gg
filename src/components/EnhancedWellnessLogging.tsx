
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WaterCalorieTracker } from './WaterCalorieTracker';
import { MoodTracker } from './MoodTracker';
import { ChallengeSystem } from './ChallengeSystem';
import { CustomCategoryManager } from './CustomCategoryManager';

export function EnhancedWellnessLogging() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Wellness & Habits</h2>
        <CustomCategoryManager defaultType="habit" />
      </div>
      
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
