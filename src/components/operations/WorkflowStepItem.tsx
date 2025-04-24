
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/types/workflow-types';

interface WorkflowStepItemProps {
  step: WorkflowStep;
  index: number;
  onComplete: (stepId: string) => void;
}

const WorkflowStepItem: React.FC<WorkflowStepItemProps> = ({ 
  step, 
  index,
  onComplete 
}) => {
  return (
    <Card className={cn(
      "border-l-4",
      step.isComplete ? "border-l-green-500" : "border-l-gray-300"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full p-0 w-8 h-8"
              disabled={step.isComplete}
              onClick={() => onComplete(step.id)}
            >
              {step.isComplete ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400" />
              )}
            </Button>
            <div>
              <p className="font-medium">{step.name}</p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
          <Badge variant="outline">
            Step {index + 1}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowStepItem;
