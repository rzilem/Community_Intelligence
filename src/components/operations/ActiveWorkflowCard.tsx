
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, PauseCircle, PlayCircle, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Workflow } from '@/types/workflow-types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActiveWorkflowCardProps {
  workflow: Workflow;
  onViewDetails: (id: string) => void;
  onPauseWorkflow: (id: string) => void;
  onResumeWorkflow: (id: string) => void;
  onCancelWorkflow: (id: string) => void;
}

const ActiveWorkflowCard: React.FC<ActiveWorkflowCardProps> = ({
  workflow,
  onViewDetails,
  onPauseWorkflow,
  onResumeWorkflow,
  onCancelWorkflow
}) => {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  // Calculate progress based on completed steps
  const totalSteps = workflow.steps?.length || 0;
  const completedSteps = workflow.steps?.filter(step => step.isComplete)?.length || 0;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">
            {workflow.name}
          </CardTitle>
          <Badge 
            variant={workflow.status === 'active' ? 'default' : 
                    workflow.status === 'inactive' ? 'secondary' : 
                    'outline'}
            className="capitalize"
          >
            {workflow.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {workflow.description || 'No description provided.'}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {progress}%</span>
            <span>
              {completedSteps} of {totalSteps} steps
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t">
        <div className="flex gap-2">
          {workflow.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPauseWorkflow(workflow.id)}
            >
              <PauseCircle className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResumeWorkflow(workflow.id)}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCancelDialogOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
        <Button 
          size="sm"
          onClick={() => onViewDetails(workflow.id)}
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this workflow? This action cannot be undone, 
              and all progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nevermind</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onCancelWorkflow(workflow.id);
                setIsCancelDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Yes, Cancel Workflow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ActiveWorkflowCard;
