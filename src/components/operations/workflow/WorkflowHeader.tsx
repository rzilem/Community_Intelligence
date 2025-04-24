
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, Play, Pause } from 'lucide-react';
import { Workflow } from '@/types/workflow-types';

interface WorkflowHeaderProps {
  workflow: Workflow;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  isPaused: boolean;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  workflow,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  isPaused
}) => {
  return (
    <div className="flex justify-between">
      <div>
        <h2 className="text-2xl font-semibold">{workflow.name}</h2>
        <p className="mt-2 text-muted-foreground">{workflow.description || 'No description provided'}</p>
      </div>
      <div className="flex items-start gap-2">
        {isPaused ? (
          <Button variant="outline" size="sm" onClick={onToggleStatus}>
            <Play className="h-4 w-4 mr-1" />
            Resume
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onToggleStatus}>
            <Pause className="h-4 w-4 mr-1" />
            Pause
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy className="h-4 w-4 mr-1" />
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default WorkflowHeader;
