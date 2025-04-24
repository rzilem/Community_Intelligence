
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, PlayCircle, Star, Edit, Trash2, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Workflow } from '@/types/workflow-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

interface WorkflowListItemProps {
  workflow: Workflow;
  onViewDetails?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const WorkflowListItem: React.FC<WorkflowListItemProps> = ({
  workflow,
  onViewDetails,
  onDuplicate,
}) => {
  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-amber-100 text-amber-800 border-amber-200",
    draft: "bg-slate-100 text-slate-800 border-slate-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    archived: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const statusColor = statusColors[workflow.status as keyof typeof statusColors] || "";
  
  return (
    <Card className="transition-all hover:shadow-md h-full">
      <CardHeader className="p-3 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-bold truncate">
            {workflow.name}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`capitalize text-xs py-0 px-1.5 ${statusColor}`}>
              {workflow.status}
            </Badge>
            <Badge variant="outline" className="capitalize text-xs py-0 px-1.5">
              {workflow.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-muted-foreground text-xs line-clamp-2 h-8">
          {workflow.description || 'No description provided.'}
        </p>
        
        <div className="text-xs text-muted-foreground mt-2 flex justify-between">
          <div>
            <span className="font-medium">Steps: </span>
            {workflow.steps?.length || 0} total
          </div>
          <div>
            <span className="font-medium">Created: </span>
            {new Date(workflow.created_at || '').toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-3 pt-1 border-t text-xs">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onDuplicate && onDuplicate(workflow.id)}
        >
          <Copy className="h-3 w-3 mr-1" />
          Duplicate
        </Button>
        
        <Link to={`/operations/workflows/${workflow.id}`}>
          <Button 
            size="sm"
            className="h-7 text-xs"
          >
            <ArrowRight className="h-3 w-3 mr-1" />
            View
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default WorkflowListItem;
