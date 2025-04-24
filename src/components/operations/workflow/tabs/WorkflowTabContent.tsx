
import React from 'react';
import { Workflow } from '@/types/workflow-types';
import WorkflowListItem from '../WorkflowListItem';
import WorkflowTemplateCard from '../../WorkflowTemplateCard';

interface WorkflowTabContentProps {
  workflows: Workflow[];
  isLoading: boolean;
  onViewDetails: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUseTemplate?: (id: string) => void;
  isTemplate?: boolean;
}

const WorkflowTabContent: React.FC<WorkflowTabContentProps> = ({
  workflows,
  isLoading,
  onViewDetails,
  onDuplicate,
  onUseTemplate,
  isTemplate
}) => {
  if (isLoading) {
    return <p>Loading workflows...</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {isTemplate ? (
        workflows.map(workflow => (
          <WorkflowTemplateCard
            key={workflow.id}
            workflow={workflow}
            onUseTemplate={onUseTemplate}
            onDuplicateTemplate={onDuplicate}
          />
        ))
      ) : (
        workflows.map(workflow => (
          <WorkflowListItem
            key={workflow.id}
            workflow={workflow}
            onViewDetails={onViewDetails}
            onDuplicate={onDuplicate}
          />
        ))
      )}
    </div>
  );
};

export default WorkflowTabContent;
