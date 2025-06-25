
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen } from 'lucide-react';
import { useMoodTracker } from '../hooks/useMoodTracker';

export function JournalPrompt() {
  const { addJournalEntry, getTodaysJournalEntry } = useMoodTracker();
  const [isOpen, setIsOpen] = useState(false);
  const [wentWell, setWentWell] = useState('');
  const [didntGoWell, setDidntGoWell] = useState('');

  const todaysEntry = getTodaysJournalEntry();

  useEffect(() => {
    if (todaysEntry) {
      setWentWell(todaysEntry.wentWell);
      setDidntGoWell(todaysEntry.didntGoWell);
    } else {
      setWentWell('');
      setDidntGoWell('');
    }
  }, [todaysEntry]);

  const handleSubmit = () => {
    addJournalEntry(wentWell, didntGoWell);
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Daily Reflection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todaysEntry ? (
            <div className="text-sm text-muted-foreground">
              ✅ Today's reflection completed
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Take a moment to reflect on your day
            </div>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                {todaysEntry ? 'Update Reflection' : 'Start Daily Reflection'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Daily Reflection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    What went well today?
                  </label>
                  <Textarea
                    value={wentWell}
                    onChange={(e) => setWentWell(e.target.value)}
                    placeholder="Think about your accomplishments, positive moments, or things you're grateful for..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    What didn't go well today?
                  </label>
                  <Textarea
                    value={didntGoWell}
                    onChange={(e) => setDidntGoWell(e.target.value)}
                    placeholder="Think about challenges, areas for improvement, or lessons learned..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Save Reflection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
