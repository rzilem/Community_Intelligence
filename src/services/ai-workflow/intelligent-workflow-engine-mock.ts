export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: any;
  dependencies: string[];
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  result?: any;
  error?: string;
}

export class IntelligentWorkflowEngine {
  private static mockWorkflows: any[] = [
    {
      id: 'workflow-1',
      name: 'Payment Reminder Workflow',
      description: 'Automated payment reminder system',
      steps: [],
      is_active: true,
      association_id: 'default-hoa',
      created_at: new Date().toISOString()
    }
  ];

  private static mockExecutions: WorkflowExecution[] = [];

  static async createWorkflow(workflow: any): Promise<any> {
    const newWorkflow = {
      id: crypto.randomUUID(),
      ...workflow,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockWorkflows.push(newWorkflow);
    return newWorkflow;
  }

  static async getWorkflows(associationId: string): Promise<any[]> {
    return this.mockWorkflows.filter(w => w.association_id === associationId);
  }

  static async executeWorkflow(workflowId: string, context?: any): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflow_id: workflowId,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      result: { message: 'Workflow executed successfully', context }
    };

    this.mockExecutions.push(execution);
    return execution;
  }

  static async getExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    return this.mockExecutions.filter(e => e.workflow_id === workflowId);
  }

  static async updateWorkflow(workflowId: string, updates: any): Promise<any> {
    const index = this.mockWorkflows.findIndex(w => w.id === workflowId);
    if (index === -1) return null;

    this.mockWorkflows[index] = {
      ...this.mockWorkflows[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockWorkflows[index];
  }

  static async deleteWorkflow(workflowId: string): Promise<boolean> {
    const index = this.mockWorkflows.findIndex(w => w.id === workflowId);
    if (index === -1) return false;

    this.mockWorkflows.splice(index, 1);
    return true;
  }
}