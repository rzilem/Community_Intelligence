
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, PlayCircle, Star, Edit, Trash2 } from 'lucide-react';
import { Workflow } from '@/types/workflow-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface WorkflowTemplateCardProps {
  workflow: Workflow;
  onUseTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  onEditTemplate?: (id: string) => void;
  onDeleteTemplate?: (id: string) => void;
}

const WorkflowTemplateCard: React.FC<WorkflowTemplateCardProps> = ({
  workflow,
  onUseTemplate,
  onDuplicateTemplate,
  onEditTemplate,
  onDeleteTemplate
}) => {
  return (
    <Card className="transition-all hover:shadow-md h-full">
      <CardHeader className="p-3 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-bold truncate">
            {workflow.name}
            {workflow.isPopular && (
              <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-800 border-amber-200 text-xs py-0">
                <Star className="h-2.5 w-2.5 mr-1 fill-amber-500 text-amber-500" />
                Popular
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-0.5">
            <Badge variant="outline" className="capitalize text-xs py-0 px-1.5">
              {workflow.type}
            </Badge>
            
            {(onEditTemplate || onDeleteTemplate) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-6 w-6 p-0" aria-label="More options">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditTemplate && (
                    <DropdownMenuItem onClick={() => onEditTemplate(workflow.id)}>
                      <Edit className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDeleteTemplate && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteTemplate(workflow.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-muted-foreground text-xs line-clamp-2 h-8">
          {workflow.description || 'No description provided.'}
        </p>
        
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Steps: </span>
          {workflow.steps?.length || 0}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-3 pt-1 border-t text-xs">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onDuplicateTemplate(workflow.id)}
        >
          <Copy className="h-3 w-3 mr-1" />
          Duplicate
        </Button>
        <Button 
          size="sm"
          className="h-7 text-xs"
          onClick={() => onUseTemplate(workflow.id)}
        >
          <PlayCircle className="h-3 w-3 mr-1" />
          Use
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkflowTemplateCard;
