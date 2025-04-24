
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { WorkflowType } from '@/types/workflow-types';

interface NewWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowName: string;
  workflowDescription: string;
  workflowType: WorkflowType;
  templateId: string | null;
  templates: Array<{ id: string; name: string }>;
  isCreating: boolean;
  onWorkflowNameChange: (value: string) => void;
  onWorkflowDescriptionChange: (value: string) => void;
  onWorkflowTypeChange: (value: WorkflowType) => void;
  onTemplateIdChange: (value: string) => void;
  onCreate: () => void;
}

export const NewWorkflowDialog: React.FC<NewWorkflowDialogProps> = ({
  open,
  onOpenChange,
  workflowName,
  workflowDescription,
  workflowType,
  templateId,
  templates,
  isCreating,
  onWorkflowNameChange,
  onWorkflowDescriptionChange,
  onWorkflowTypeChange,
  onTemplateIdChange,
  onCreate,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogDescription>
          Start from scratch or use a template to create your workflow.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Workflow Name</Label>
          <Input
            id="name"
            placeholder="Workflow name"
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Workflow description"
            value={workflowDescription}
            onChange={(e) => onWorkflowDescriptionChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={workflowType}
            onValueChange={(value) => onWorkflowTypeChange(value as WorkflowType)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select workflow type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Financial">Financial</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Resident Management">Resident Management</SelectItem>
              <SelectItem value="Governance">Governance</SelectItem>
              <SelectItem value="Communication">Communication</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="template">Use Template (optional)</Label>
          <Select onValueChange={onTemplateIdChange}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
              <SelectItem value="">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onCreate} disabled={!workflowName || isCreating}>
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
