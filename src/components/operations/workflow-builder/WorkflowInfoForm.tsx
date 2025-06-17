
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowType } from '@/types/workflow-types';

interface WorkflowInfoFormProps {
  name: string;
  description: string;
  type: WorkflowType;
  onInputChange: (field: string, value: string) => void;
}

const workflowTypes: WorkflowType[] = [
  'Financial',
  'Compliance',
  'Maintenance',
  'Resident Management',
  'Governance',
  'Communication'
];

const WorkflowInfoForm: React.FC<WorkflowInfoFormProps> = ({
  name,
  description,
  type,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="wf-name">Name</Label>
          <Input 
            id="wf-name" 
            value={name} 
            onChange={e => onInputChange('name', e.target.value)} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wf-type">Type</Label>
          <Select value={type} onValueChange={val => onInputChange('type', val)}>
            <SelectTrigger id="wf-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {workflowTypes.map(workflowType => (
                <SelectItem key={workflowType} value={workflowType}>
                  {workflowType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wf-desc">Description</Label>
          <Textarea 
            id="wf-desc" 
            value={description} 
            onChange={e => onInputChange('description', e.target.value)} 
            rows={3} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowInfoForm;
