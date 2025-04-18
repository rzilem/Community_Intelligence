
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, PlayCircle, Star } from 'lucide-react';
import { Workflow } from '@/types/workflow-types';

interface WorkflowTemplateCardProps {
  workflow: Workflow;
  onUseTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
}

const WorkflowTemplateCard: React.FC<WorkflowTemplateCardProps> = ({
  workflow,
  onUseTemplate,
  onDuplicateTemplate
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
          <Badge variant="outline" className="capitalize">
            {workflow.type}
          </Badge>
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
