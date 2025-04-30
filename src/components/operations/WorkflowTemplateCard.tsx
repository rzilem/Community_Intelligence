
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
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">
            {workflow.name}
            {workflow.isPopular && (
              <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                Popular
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="capitalize">
              {workflow.type}
            </Badge>
            
            {(onEditTemplate || onDeleteTemplate) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" aria-label="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditTemplate && (
                    <DropdownMenuItem onClick={() => onEditTemplate(workflow.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDeleteTemplate && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteTemplate(workflow.id)}
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
        
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Steps: </span>
            {workflow.steps?.length || 0}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDuplicateTemplate(workflow.id)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        <Button 
          size="sm"
          onClick={() => onUseTemplate(workflow.id)}
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkflowTemplateCard;
