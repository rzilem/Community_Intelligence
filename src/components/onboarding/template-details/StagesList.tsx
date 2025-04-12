
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OnboardingStage, OnboardingTask } from '@/types/onboarding-types';
import StageCard from './StageCard';

interface StagesListProps {
  stages: OnboardingStage[];
  tasks: Record<string, OnboardingTask[]>;
  onAddStageClick: () => void;
}

const StagesList = ({ stages, tasks, onAddStageClick }: StagesListProps) => {
  if (stages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground text-center">
            No stages found. Add your first stage to get started.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onAddStageClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Stage
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <StageCard 
          key={stage.id}
          stage={stage}
          tasks={tasks[stage.id] || []}
        />
      ))}
    </div>
  );
};

export default StagesList;
