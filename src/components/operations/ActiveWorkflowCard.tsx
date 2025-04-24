
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pause, Play, XCircle, Eye, Edit } from 'lucide-react';
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
  onEditWorkflow: (id: string) => void;
  onDeleteWorkflow: (id: string) => void;
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
  const isPaused = workflow.status === 'inactive';
  
  return (
    <Card className="transition-all hover:shadow-md h-full">
      <CardHeader className="p-3 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-bold truncate">
            {workflow.name}
          </CardTitle>
          <div className="flex items-center space-x-0.5">
            <Badge variant="outline" className="capitalize text-xs py-0 px-1.5">
              {workflow.type}
            </Badge>
            <Badge 
              variant={isPaused ? "outline" : "default"} 
              className={`text-xs py-0 px-1.5 ${isPaused ? 'text-amber-500' : ''}`}
            >
              {isPaused ? 'Paused' : 'Active'}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0" aria-label="More options">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(workflow.id)}>
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditWorkflow(workflow.id)}>
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteWorkflow(workflow.id)}
                  className="text-red-600"
                >
                  <XCircle className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-muted-foreground text-xs line-clamp-2 h-8">
          {workflow.description || 'No description provided.'}
        </p>
        
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Progress: </span>
          {workflow.steps?.filter(s => s.isComplete).length || 0} / {workflow.steps?.length || 0} steps
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-3 pt-1 border-t text-xs">
        {isPaused ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onResumeWorkflow(workflow.id)}
          >
            <Play className="h-3 w-3 mr-1" />
            Resume
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onPauseWorkflow(workflow.id)}
          >
            <Pause className="h-3 w-3 mr-1" />
            Pause
          </Button>
        )}
        <Button 
          variant="destructive"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onCancelWorkflow(workflow.id)}
        >
          <XCircle className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActiveWorkflowCard;
