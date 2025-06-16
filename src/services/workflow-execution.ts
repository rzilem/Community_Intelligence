import { WorkflowStep } from '@/types/workflow-types';
import type { UserRole } from '@/types/profile-types';

export interface WorkflowExecutionStep extends WorkflowStep {
  automated?: boolean;
  notifyRoles?: UserRole[];
  execute?: () => void;
}

export interface WorkflowExecution {
  id: string;
  steps: WorkflowExecutionStep[];
}

/**
 * Executes a workflow by running automated steps and triggering notifications
 * for the specified roles using the provided notify callback.
 */
export function executeWorkflow(
  workflow: WorkflowExecution,
  notify: (role: UserRole, step: WorkflowExecutionStep) => void
): void {
  workflow.steps.forEach(step => {
    if (step.automated && step.execute) {
      step.execute();
    }
    if (step.notifyRoles) {
      step.notifyRoles.forEach(role => notify(role, step));
    }
  });
}
