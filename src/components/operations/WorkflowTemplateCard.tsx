
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
  Copy
} from 'lucide-react';
import { Workflow } from '@/types/workflow-types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowTemplateCardProps {
  workflow: Workflow;
  onUseTemplate: (workflowId: string) => void;
  onDuplicateTemplate: (workflowId: string) => void;
}

const WorkflowTemplateCard: React.FC<WorkflowTemplateCardProps> = ({ 
  workflow, 
  onUseTemplate,
  onDuplicateTemplate
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

  const stepsCount = workflow.steps.length;

  return (
    <Card className="h-full">
      <CardContent className="pt-6 pb-4 px-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          {getWorkflowIcon()}
          <span className="text-sm text-gray-500">{workflow.type}</span>
        </div>

        <h3 className="text-lg font-semibold mb-2">{workflow.name}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-grow">{workflow.description}</p>
        
        <div className="mt-auto">
          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-500">{stepsCount} steps in this workflow</span>
          </div>

          {workflow.isPopular && (
            <Badge className="mb-3 bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200">
              Popular Template
            </Badge>
          )}

          <div className="grid grid-cols-2 gap-2 mb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => onDuplicateTemplate(workflow.id)} 
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a copy of this template</TooltipContent>
            </Tooltip>
          </div>

          <Button 
            onClick={() => onUseTemplate(workflow.id)} 
            className="w-full"
          >
            Use Template
            <span className="ml-2">→</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowTemplateCard;
