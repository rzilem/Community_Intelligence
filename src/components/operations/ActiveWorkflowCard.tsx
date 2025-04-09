
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
  MoreHorizontal
} from 'lucide-react';
import { Workflow } from '@/types/workflow-types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActiveWorkflowCardProps {
  workflow: Workflow;
}

const ActiveWorkflowCard: React.FC<ActiveWorkflowCardProps> = ({ workflow }) => {
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

  const completedSteps = workflow.steps.filter(step => step.isComplete).length;
  const totalSteps = workflow.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="h-full">
      <CardContent className="pt-6 pb-4 px-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          {getWorkflowIcon()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Workflow</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="text-lg font-semibold mb-2">{workflow.name}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-grow">{workflow.description}</p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium">{completedSteps}/{totalSteps} steps</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <Badge className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200">
              {workflow.type}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveWorkflowCard;
