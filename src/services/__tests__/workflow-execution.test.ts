import { describe, expect, it, vi } from 'vitest';
import { executeWorkflow, WorkflowExecution } from '../workflow-execution';

function step(options: Partial<WorkflowExecution['steps'][number]> & { id: string; name: string; order: number }) {
  return { description: '', ...options } as any;
}

describe('executeWorkflow', () => {
  it('runs automated steps and triggers notifications', () => {
    const autoFn = vi.fn();
    const manualFn = vi.fn();
    const workflow: WorkflowExecution = {
      id: 'wf1',
      steps: [
        step({ id: '1', name: 'auto', order: 0, automated: true, notifyRoles: ['admin'], execute: autoFn }),
        step({ id: '2', name: 'manual', order: 1, automated: false, notifyRoles: ['member'], execute: manualFn })
      ]
    };
    const notify = vi.fn();

    executeWorkflow(workflow, notify);

    expect(autoFn).toHaveBeenCalledOnce();
    expect(manualFn).not.toHaveBeenCalled();
    expect(notify).toHaveBeenNthCalledWith(1, 'admin', workflow.steps[0] as any);
    expect(notify).toHaveBeenNthCalledWith(2, 'member', workflow.steps[1] as any);
  });

  it('triggers notifications for all roles on a step', () => {
    const stepFn = vi.fn();
    const workflow: WorkflowExecution = {
      id: 'wf2',
      steps: [
        step({ id: 'a', name: 'auto', order: 0, automated: true, notifyRoles: ['admin', 'manager'], execute: stepFn })
      ]
    };
    const notify = vi.fn();

    executeWorkflow(workflow, notify);

    expect(stepFn).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledTimes(2);
    expect(notify).toHaveBeenCalledWith('admin', workflow.steps[0] as any);
    expect(notify).toHaveBeenCalledWith('manager', workflow.steps[0] as any);
  });
});
