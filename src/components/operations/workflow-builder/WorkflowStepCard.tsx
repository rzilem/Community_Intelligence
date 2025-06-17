
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MoveUp, MoveDown, Trash2 } from 'lucide-react';
import { WorkflowStep } from '@/types/workflow-types';
import type { UserRole } from '@/types/profile-types';

interface WorkflowStepCardProps {
  step: WorkflowStep;
  index: number;
  totalSteps: number;
  onStepChange: (stepId: string, field: string, value: any) => void;
  onMoveUp: (stepId: string) => void;
  onMoveDown: (stepId: string) => void;
  onDelete: (stepId: string) => void;
  onNotifyRoleChange: (stepId: string, roleId: UserRole, checked: boolean) => void;
}

const roles: { id: UserRole; name: string }[] = [
  { id: 'admin', name: 'Administrator' },
  { id: 'manager', name: 'Manager' },
  { id: 'resident', name: 'Resident' },
  { id: 'maintenance', name: 'Maintenance' },
  { id: 'member', name: 'Member' },
  { id: 'accountant', name: 'Accountant' },
  { id: 'treasurer', name: 'Treasurer' },
  { id: 'user', name: 'Basic User' }
];

const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({
  step,
  index,
  totalSteps,
  onStepChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onNotifyRoleChange
}) => {
  return (
    <AccordionItem value={step.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 items-center">
          <span className="font-medium">{index + 1}. {step.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor={`step-name-${step.id}`}>Step Name</Label>
            <Input 
              id={`step-name-${step.id}`} 
              value={step.name} 
              onChange={e => onStepChange(step.id, 'name', e.target.value)} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`step-desc-${step.id}`}>Description</Label>
            <Textarea 
              id={`step-desc-${step.id}`} 
              value={step.description || ''} 
              onChange={e => onStepChange(step.id, 'description', e.target.value)} 
              rows={3} 
            />
          </div>
          <div className="grid gap-2">
            <Label>Notify Roles</Label>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`notify-${step.id}-${role.id}`}
                    checked={step.notifyRoles?.includes(role.id) || false}
                    onCheckedChange={checked => onNotifyRoleChange(step.id, role.id, !!checked)}
                  />
                  <label htmlFor={`notify-${step.id}-${role.id}`} className="text-sm">
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`auto-${step.id}`}
              checked={step.autoExecute || false}
              onCheckedChange={checked => onStepChange(step.id, 'autoExecute', checked)}
            />
            <Label htmlFor={`auto-${step.id}`}>Auto Execute</Label>
          </div>
          <div className="flex justify-between pt-2">
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onMoveUp(step.id)} 
                disabled={index === 0}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onMoveDown(step.id)} 
                disabled={index === totalSteps - 1}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(step.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete Step
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default WorkflowStepCard;
