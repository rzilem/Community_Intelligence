
import React from 'react';
import { FormWorkflowStep } from '@/types/form-workflow-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Trash2,
  Mail,
  Bell,
  ClipboardList,
  User,
  CheckCircle,
  Globe,
  Home
} from 'lucide-react';

interface WorkflowStepListProps {
  steps: FormWorkflowStep[];
  onSelectStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
}

const triggerLabels: Record<string, string> = {
  on_submit: 'On Form Submission',
  on_approval: 'On Form Approval',
  on_rejection: 'On Form Rejection',
  on_status_change: 'On Status Change'
};

const actionIcons: Record<string, React.ReactNode> = {
  send_email: <Mail className="h-4 w-4" />,
  send_notification: <Bell className="h-4 w-4" />,
  create_request: <ClipboardList className="h-4 w-4" />,
  update_property: <Home className="h-4 w-4" />,
  assign_task: <User className="h-4 w-4" />,
  update_status: <CheckCircle className="h-4 w-4" />,
  webhook: <Globe className="h-4 w-4" />
};

const WorkflowStepList: React.FC<WorkflowStepListProps> = ({ 
  steps, 
  onSelectStep,
  onDeleteStep
}) => {
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <Card 
          key={step.id} 
          className={`cursor-pointer hover:shadow-md transition-shadow ${!step.isEnabled ? 'opacity-60' : ''}`}
        >
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-base">
                <span className="mr-2">{step.name}</span>
                {!step.isEnabled && (
                  <Badge variant="outline" className="ml-2">Disabled</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStep(step.id);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSelectStep(step.id)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2" onClick={() => onSelectStep(step.id)}>
            <div className="mb-2">
              <Badge variant="secondary">
                {triggerLabels[step.trigger] || step.trigger}
              </Badge>
            </div>
            
            {step.conditions.length > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Conditions:</span> {step.conditions.length} defined
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {step.actions.map((action) => (
                <Badge key={action.id} variant="outline" className="flex items-center gap-1">
                  {actionIcons[action.type] || null}
                  <span>{action.name}</span>
                </Badge>
              ))}
              {step.actions.length === 0 && (
                <span className="text-xs text-muted-foreground">No actions defined</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkflowStepList;
