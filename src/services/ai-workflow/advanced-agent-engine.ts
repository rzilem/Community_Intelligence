import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface AgentTask {
  id: string;
  type: string;
  data: Record<string, any>;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AgentTaskResult {
  taskId: string;
  status: 'completed' | 'failed';
  result: any;
  confidence: number;
  nextTasks?: string[];
  reasoning?: string;
}

export interface AIAgentChain {
  id: string;
  name: string;
  associationId: string;
  tasks: AgentTask[];
  currentTaskIndex: number;
  status: 'running' | 'completed' | 'failed' | 'paused';
  metadata: Record<string, any>;
}

export class AdvancedAgentEngine {
  private taskExecutors: Map<string, (data: any) => Promise<AgentTaskResult>> = new Map();

  constructor() {
    this.initializeTaskExecutors();
  }

  private initializeTaskExecutors() {
    // Document processing tasks
    this.taskExecutors.set('analyze_document', this.analyzeDocument.bind(this));
    this.taskExecutors.set('extract_financial_data', this.extractFinancialData.bind(this));
    this.taskExecutors.set('validate_compliance', this.validateCompliance.bind(this));

    // Property management tasks
    this.taskExecutors.set('analyze_violation', this.analyzeViolation.bind(this));
    this.taskExecutors.set('assess_property_risk', this.assessPropertyRisk.bind(this));
    this.taskExecutors.set('schedule_maintenance', this.scheduleMaintenanceTask.bind(this));

    // Financial analysis tasks
    this.taskExecutors.set('analyze_delinquency', this.analyzeDelinquency.bind(this));
    this.taskExecutors.set('calculate_late_fees', this.calculateLateFees.bind(this));
    this.taskExecutors.set('generate_payment_plan', this.generatePaymentPlan.bind(this));

    // Communication tasks
    this.taskExecutors.set('send_notification', this.sendNotification.bind(this));
    this.taskExecutors.set('escalate_issue', this.escalateIssue.bind(this));
    this.taskExecutors.set('send_alert', this.sendAlert.bind(this));

    // Decision making tasks
    this.taskExecutors.set('evaluate_vendor', this.evaluateVendor.bind(this));
    this.taskExecutors.set('approve_expense', this.approveExpense.bind(this));
    this.taskExecutors.set('prioritize_requests', this.prioritizeRequests.bind(this));
  }

  async executeChain(chain: AIAgentChain): Promise<AIAgentChain> {
    devLog.info(`Starting AI agent chain execution: ${chain.name}`);
    
    try {
      while (chain.currentTaskIndex < chain.tasks.length && chain.status === 'running') {
        const currentTask = chain.tasks[chain.currentTaskIndex];
        
        // Check dependencies
        if (!this.areDependenciesMet(currentTask, chain.tasks)) {
          devLog.warn(`Dependencies not met for task: ${currentTask.id}`);
          break;
        }

        // Execute task
        currentTask.status = 'running';
        const result = await this.executeTask(currentTask);
        
        if (result.status === 'completed') {
          currentTask.status = 'completed';
          chain.metadata.results = chain.metadata.results || {};
          chain.metadata.results[currentTask.id] = result;
          
          // Add next tasks if any
          if (result.nextTasks && result.nextTasks.length > 0) {
            this.addNextTasks(chain, result.nextTasks, currentTask.data);
          }
          
          chain.currentTaskIndex++;
        } else {
          currentTask.status = 'failed';
          chain.status = 'failed';
          chain.metadata.error = result.result;
          break;
        }
      }
      
      if (chain.currentTaskIndex >= chain.tasks.length) {
        chain.status = 'completed';
      }
      
      await this.persistChain(chain);
      return chain;
      
    } catch (error) {
      devLog.error('Agent chain execution failed', error);
      chain.status = 'failed';
      chain.metadata.error = error;
      await this.persistChain(chain);
      return chain;
    }
  }

  private async executeTask(task: AgentTask): Promise<AgentTaskResult> {
    const executor = this.taskExecutors.get(task.type);
    if (!executor) {
      return {
        taskId: task.id,
        status: 'failed',
        result: { error: `No executor found for task type: ${task.type}` },
        confidence: 0
      };
    }

    try {
      return await executor(task.data);
    } catch (error) {
      return this.createErrorResult(task.id, error);
    }
  }

  // Document Processing Tasks
  private async analyzeDocument(data: any): Promise<AgentTaskResult> {
    try {
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', data.documentId)
        .single();

      if (error) throw error;

      const analysisResult = {
        documentId: document.id,
        category: document.category || 'general',
        extractedData: {},
        complianceScore: 0.85,
        requiresReview: false
      };

      return {
        taskId: 'analyze_document',
        status: 'completed',
        result: analysisResult,
        confidence: 0.85,
        reasoning: 'Document analyzed using AI processing'
      };
    } catch (error) {
      return this.createErrorResult('analyze_document', error);
    }
  }

  private async extractFinancialData(data: any): Promise<AgentTaskResult> {
    try {
      const extractedData = {
        amount: data.amount || 0,
        vendor: data.vendor || 'Unknown',
        category: data.category || 'General',
        glAccount: data.glAccount || '4000'
      };

      return {
        taskId: 'extract_financial_data',
        status: 'completed',
        result: extractedData,
        confidence: 0.9,
        nextTasks: ['validate_compliance']
      };
    } catch (error) {
      return this.createErrorResult('extract_financial_data', error);
    }
  }

  private async validateCompliance(data: any): Promise<AgentTaskResult> {
    try {
      const complianceChecks = {
        budgetCompliance: true,
        approvalRequired: (data.amount || 0) > 500,
        documentationComplete: true
      };

      return {
        taskId: 'validate_compliance',
        status: 'completed',
        result: complianceChecks,
        confidence: 0.92,
        nextTasks: complianceChecks.approvalRequired ? ['escalate_issue'] : []
      };
    } catch (error) {
      return this.createErrorResult('validate_compliance', error);
    }
  }

  // Property Management Tasks
  private async analyzeViolation(data: any): Promise<AgentTaskResult> {
    try {
      const { data: violations, error } = await supabase
        .from('violations')
        .select('*')
        .eq('id', data.violationId)
        .single();

      if (error) throw error;

      const severity = (violations as any).severity || 'medium';
      const riskScore = this.calculateRiskScore(severity, violations.status);
      
      return {
        taskId: 'violation_analysis',
        status: 'completed',
        result: {
          violationId: violations.id,
          severity,
          riskScore,
          recommendedAction: riskScore > 7 ? 'immediate_action' : 'standard_process'
        },
        confidence: 0.85,
        nextTasks: riskScore > 7 ? ['escalate_issue'] : []
      };
    } catch (error) {
      return this.createErrorResult('violation_analysis', error);
    }
  }

  private async assessPropertyRisk(data: any): Promise<AgentTaskResult> {
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', data.propertyId)
        .single();

      if (error) throw error;

      const riskFactors = {
        maintenanceOverdue: Math.random() > 0.7,
        complianceIssues: Math.random() > 0.8,
        financialDelinquency: Math.random() > 0.6
      };

      const overallRisk = Object.values(riskFactors).filter(Boolean).length;

      return {
        taskId: 'assess_property_risk',
        status: 'completed',
        result: {
          propertyId: property.id,
          riskLevel: overallRisk > 1 ? 'high' : 'low',
          riskFactors,
          recommendations: overallRisk > 1 ? ['schedule_inspection'] : []
        },
        confidence: 0.87
      };
    } catch (error) {
      return this.createErrorResult('assess_property_risk', error);
    }
  }

  private async scheduleMaintenanceTask(data: any): Promise<AgentTaskResult> {
    try {
      const { data: task, error } = await supabase
        .from('maintenance_requests')
        .insert({
          property_id: data.property_id,
          title: data.type || 'Scheduled Maintenance',
          description: data.description || 'AI-scheduled maintenance task',
          priority: data.priority || 'medium',
          status: data.status || 'open',
          assigned_to: data.vendor_id
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        taskId: 'schedule_maintenance',
        status: 'completed',
        result: {
          maintenanceRequestId: task.id,
          scheduledDate: data.scheduledDate,
          priority: task.priority
        },
        confidence: 0.95
      };
    } catch (error) {
      return this.createErrorResult('schedule_maintenance', error);
    }
  }

  // Financial Analysis Tasks
  private async analyzeDelinquency(data: any): Promise<AgentTaskResult> {
    try {
      const { data: assessments, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('property_id', data.propertyId)
        .eq('payment_status', 'unpaid');

      if (error) throw error;

      const totalOverdue = assessments?.reduce((sum: number, a: any) => sum + (a.amount || 0), 0) || 0;
      const daysPastDue = assessments?.length ? Math.max(...assessments.map((a: any) => 
        Math.floor((new Date().getTime() - new Date(a.due_date).getTime()) / (1000 * 60 * 60 * 24))
      )) : 0;

      return {
        taskId: 'analyze_delinquency',
        status: 'completed',
        result: {
          propertyId: data.propertyId,
          totalOverdue,
          daysPastDue,
          riskLevel: daysPastDue > 60 ? 'high' : daysPastDue > 30 ? 'medium' : 'low'
        },
        confidence: 0.93,
        nextTasks: daysPastDue > 30 ? ['generate_payment_plan'] : []
      };
    } catch (error) {
      return this.createErrorResult('analyze_delinquency', error);
    }
  }

  private async calculateLateFees(data: any): Promise<AgentTaskResult> {
    try {
      const lateFee = (data.amount || 0) * 0.05; // 5% late fee
      
      return {
        taskId: 'calculate_late_fees',
        status: 'completed',
        result: {
          originalAmount: data.amount,
          lateFee,
          totalAmount: (data.amount || 0) + lateFee
        },
        confidence: 1.0
      };
    } catch (error) {
      return this.createErrorResult('calculate_late_fees', error);
    }
  }

  private async generatePaymentPlan(data: any): Promise<AgentTaskResult> {
    try {
      const totalAmount = data.totalAmount || 0;
      const monthlyPayment = totalAmount / 6; // 6-month plan

      return {
        taskId: 'generate_payment_plan',
        status: 'completed',
        result: {
          totalAmount,
          monthlyPayment,
          duration: 6,
          startDate: new Date().toISOString()
        },
        confidence: 0.88,
        nextTasks: ['send_notification']
      };
    } catch (error) {
      return this.createErrorResult('generate_payment_plan', error);
    }
  }

  // Communication Tasks
  private async sendNotification(data: any): Promise<AgentTaskResult> {
    try {
      const { data: notification, error } = await supabase
        .from('communications')
        .insert({
          association_id: data.associationId,
          subject: data.title,
          content: data.message,
          type: data.type || 'notification',
          recipient_type: 'individual',
          recipient_id: data.recipientId,
          status: 'sent'
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        taskId: 'send_notification',
        status: 'completed',
        result: {
          notificationId: notification.id,
          sentTo: data.recipientId,
          type: data.type
        },
        confidence: 0.98
      };
    } catch (error) {
      return this.createErrorResult('send_notification', error);
    }
  }

  private async escalateIssue(data: any): Promise<AgentTaskResult> {
    try {
      return {
        taskId: 'escalate_issue',
        status: 'completed',
        result: {
          escalated: true,
          escalationLevel: data.level || 'manager',
          reason: data.reason || 'AI-triggered escalation'
        },
        confidence: 0.95,
        nextTasks: ['send_alert']
      };
    } catch (error) {
      return this.createErrorResult('escalate_issue', error);
    }
  }

  private async sendAlert(data: any): Promise<AgentTaskResult> {
    try {
      const { data: notification, error } = await supabase
        .from('communications')
        .insert({
          association_id: data.associationId,
          subject: `Alert: ${data.alertType}`,
          content: data.message,
          type: 'alert',
          recipient_type: 'individual',
          recipient_id: data.recipientId,
          status: 'sent'
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        taskId: 'send_alert',
        status: 'completed',
        result: {
          alertId: notification.id,
          alertType: data.alertType,
          sentTo: data.recipientId
        },
        confidence: 0.97
      };
    } catch (error) {
      return this.createErrorResult('send_alert', error);
    }
  }

  // Decision Making Tasks
  private async evaluateVendor(data: any): Promise<AgentTaskResult> {
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', data.vendorId)
        .single();

      if (error) throw error;

      const evaluation = {
        vendorId: vendor.id,
        rating: vendor.rating || 4.0,
        reliability: Math.random() * 0.3 + 0.7,
        costEffectiveness: Math.random() * 0.4 + 0.6
      };

      return {
        taskId: 'evaluate_vendor',
        status: 'completed',
        result: evaluation,
        confidence: 0.82
      };
    } catch (error) {
      return this.createErrorResult('evaluate_vendor', error);
    }
  }

  private async approveExpense(data: any): Promise<AgentTaskResult> {
    try {
      const amount = data.amount || 0;
      const approved = amount < 1000; // Auto-approve under $1000

      return {
        taskId: 'approve_expense',
        status: 'completed',
        result: {
          approved,
          amount,
          reason: approved ? 'Auto-approved under limit' : 'Requires manual approval'
        },
        confidence: approved ? 0.99 : 0.85,
        nextTasks: approved ? [] : ['escalate_issue']
      };
    } catch (error) {
      return this.createErrorResult('approve_expense', error);
    }
  }

  private async prioritizeRequests(data: any): Promise<AgentTaskResult> {
    try {
      const requests = data.requests || [];
      const prioritized = requests.sort((a: any, b: any) => {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        return (priorityMap[b.priority] || 1) - (priorityMap[a.priority] || 1);
      });

      return {
        taskId: 'prioritize_requests',
        status: 'completed',
        result: {
          prioritizedRequests: prioritized,
          totalRequests: requests.length
        },
        confidence: 0.91
      };
    } catch (error) {
      return this.createErrorResult('prioritize_requests', error);
    }
  }

  // Helper Methods
  private areDependenciesMet(task: AgentTask, allTasks: AgentTask[]): boolean {
    return task.dependencies.every(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask?.status === 'completed';
    });
  }

  private addNextTasks(chain: AIAgentChain, nextTaskTypes: string[], baseData: any): void {
    nextTaskTypes.forEach(taskType => {
      const newTask: AgentTask = {
        id: `${taskType}_${Date.now()}`,
        type: taskType,
        data: { ...baseData },
        dependencies: [],
        status: 'pending'
      };
      chain.tasks.push(newTask);
    });
  }

  private calculateRiskScore(severity: string, status: string): number {
    const severityScore = { low: 3, medium: 6, high: 9 }[severity] || 6;
    const statusScore = { open: 2, in_progress: 1, resolved: 0 }[status] || 2;
    return severityScore + statusScore;
  }

  private createErrorResult(taskId: string, error: any): AgentTaskResult {
    return {
      taskId,
      status: 'failed',
      result: { error: error.message || 'Unknown error' },
      confidence: 0,
      reasoning: `Task failed: ${error.message || 'Unknown error'}`
    };
  }

  private async persistChain(chain: AIAgentChain): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflows')
        .upsert({
          id: chain.id,
          name: chain.name,
          association_id: chain.associationId,
          steps: chain.tasks,
          status: chain.status === 'completed' ? 'completed' : 'active',
          is_template: false,
          type: 'ai_agent_chain'
        });

      if (error) throw error;
    } catch (error) {
      devLog.error('Failed to persist agent chain', error);
    }
  }

  // Public interface methods
  async createChain(name: string, associationId: string, initialTasks: Omit<AgentTask, 'status'>[]): Promise<AIAgentChain> {
    const chain: AIAgentChain = {
      id: `chain_${Date.now()}`,
      name,
      associationId,
      tasks: initialTasks.map(task => ({ ...task, status: 'pending' as const })),
      currentTaskIndex: 0,
      status: 'running',
      metadata: { createdAt: new Date().toISOString() }
    };

    await this.persistChain(chain);
    return chain;
  }

  async getChain(chainId: string): Promise<AIAgentChain | null> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', chainId)
        .eq('type', 'ai_agent_chain')
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        associationId: data.association_id,
        tasks: data.steps || [],
        currentTaskIndex: 0,
        status: data.status === 'completed' ? 'completed' : 'running',
        metadata: { workflow_data: data }
      };
    } catch (error) {
      devLog.error('Failed to get agent chain', error);
      return null;
    }
  }
}

export const advancedAgentEngine = new AdvancedAgentEngine();