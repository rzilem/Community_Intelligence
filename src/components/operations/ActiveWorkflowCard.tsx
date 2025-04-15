
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  AlertTriangle, 
  ClipboardList, 
  MessageSquare, 
  Calendar, 
  Home,
  Eye,
  XCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { Workflow } from '@/types/workflow-types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface ActiveWorkflowCardProps {
  workflow: Workflow;
  onViewDetails?: (workflowId: string) => void;
  onPauseWorkflow?: (workflowId: string) => void;
  onResumeWorkflow?: (workflowId: string) => void;
  onCancelWorkflow?: (workflowId: string) => void;
}

const ActiveWorkflowCard: React.FC<ActiveWorkflowCardProps> = ({ 
  workflow,
  onViewDetails,
  onPauseWorkflow,
  onResumeWorkflow,
  onCancelWorkflow
}) => {
  const getWorkflowIcon = () => {
    switch (workflow.type) {
      case 'Financial':
        return <CreditCard className="h-10 w-10 text-orange-500" />;
      case 'Compliance':
        return <AlertTriangle className="h-10 w-10 text-red-500" />;
      case 'Maintenance':
        return <ClipboardList className="h-10 w-10 text-green-500" />;
      case 'Resident Management':
        return <MessageSquare className="h-10 w-10 text-blue-500" />;
      case 'Governance':
        return <Calendar className="h-10 w-10 text-purple-500" />;
      case 'Communication':
        return <MessageSquare className="h-10 w-10 text-indigo-500" />;
      default:
        return <Home className="h-10 w-10 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (workflow.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      case 'inactive':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Paused</Badge>;
      default:
        return <Badge>{workflow.status}</Badge>;
    }
  };

  const completedSteps = workflow.steps.filter(step => step.isComplete).length;
  const totalSteps = workflow.steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <Card className="h-full">
      <CardContent className="pt-6 pb-4 px-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          {getWorkflowIcon()}
          <div>{getStatusBadge()}</div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{workflow.name}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-grow">{workflow.description}</p>
        
        <div className="mt-auto">
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress:</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground">Steps:</span>
            <span className="font-medium">{completedSteps} of {totalSteps} completed</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {workflow.status === 'active' && onPauseWorkflow && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => onPauseWorkflow(workflow.id)} 
                      variant="outline"
                      size="sm"
                    >
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Pause this workflow</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {workflow.status === 'inactive' && onResumeWorkflow && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => onResumeWorkflow(workflow.id)} 
                      variant="outline"
                      size="sm"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resume this workflow</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onCancelWorkflow && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => onCancelWorkflow(workflow.id)} 
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cancel this workflow</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {onViewDetails && (
            <Button 
              onClick={() => onViewDetails(workflow.id)} 
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveWorkflowCard;
