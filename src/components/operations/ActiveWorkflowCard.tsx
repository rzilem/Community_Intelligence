
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, PauseCircle, Eye, XCircle, Calendar, Edit, Trash2 } from 'lucide-react';
import { Workflow } from '@/types/workflow-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ActiveWorkflowCardProps {
  workflow: Workflow;
  onViewDetails: (id: string) => void;
  onPauseWorkflow: (id: string) => void;
  onResumeWorkflow: (id: string) => void;
  onCancelWorkflow: (id: string) => void;
  onEditWorkflow?: (id: string) => void;
  onDeleteWorkflow?: (id: string) => void;
}

const ActiveWorkflowCard: React.FC<ActiveWorkflowCardProps> = ({
  workflow,
  onViewDetails,
  onPauseWorkflow,
  onResumeWorkflow,
  onCancelWorkflow,
  onEditWorkflow,
  onDeleteWorkflow
}) => {
  // Function to check if all steps are completed
  const getProgressPercentage = () => {
    if (!workflow.steps || workflow.steps.length === 0) return 0;
    const completedSteps = workflow.steps.filter(step => step.isComplete).length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  const isActive = workflow.status === 'active';
  const progressPercentage = getProgressPercentage();

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{workflow.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className="capitalize"
            >
              {workflow.status}
            </Badge>
            
            {(onEditWorkflow || onDeleteWorkflow) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" aria-label="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditWorkflow && (
                    <DropdownMenuItem onClick={() => onEditWorkflow(workflow.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDeleteWorkflow && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteWorkflow(workflow.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {workflow.description || 'No description provided.'}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Type: </span>
              {workflow.type}
            </div>
            <div>
              <span className="font-medium">Steps: </span>
              {workflow.steps?.length || 0}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => isActive ? onPauseWorkflow(workflow.id) : onResumeWorkflow(workflow.id)}
        >
          {isActive ? (
            <>
              <PauseCircle className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Resume
            </>
          )}
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onCancelWorkflow(workflow.id)}
            className="text-destructive hover:text-destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={() => onViewDetails(workflow.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActiveWorkflowCard;
