
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WaterCalorieTracker } from './WaterCalorieTracker';
import { MoodTracker } from './MoodTracker';
import { ChallengeSystem } from './ChallengeSystem';
import { CustomCategoriesManager } from './CustomCategoriesManager';

export function EnhancedWellnessLogging() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="water-calories" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="water-calories">Water & Calories</TabsTrigger>
          <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
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
        
        <TabsContent value="categories">
          <CustomCategoriesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
