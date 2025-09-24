export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any[];
  is_active: boolean;
  association_id: string;
  created_at: string;
  updated_at: string;
  execution_count: number;
  last_executed: string | null;
}

export interface RuleExecution {
  id: string;
  rule_id: string;
  status: 'success' | 'failed' | 'partial';
  execution_time: string;
  result: any;
  error_message?: string;
}

export class AutomationRulesEngine {
  private static mockRules: AutomationRule[] = [
    {
      id: 'rule-1',
      name: 'Late Payment Reminder',
      description: 'Send automatic reminders for late payments',
      trigger_type: 'schedule',
      trigger_conditions: { days_overdue: 5 },
      actions: [{ type: 'send_email', template: 'late_payment_reminder' }],
      is_active: true,
      association_id: 'default-hoa',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 15,
      last_executed: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  private static mockExecutions: RuleExecution[] = [];

  static async createRule(rule: Partial<AutomationRule>): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      id: crypto.randomUUID(),
      name: rule.name || 'New Rule',
      description: rule.description || '',
      trigger_type: rule.trigger_type || 'manual',
      trigger_conditions: rule.trigger_conditions || {},
      actions: rule.actions || [],
      is_active: rule.is_active ?? true,
      association_id: rule.association_id || 'default-hoa',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_executed: null
    };

    this.mockRules.push(newRule);
    return newRule;
  }

  static async getRules(associationId: string): Promise<AutomationRule[]> {
    return this.mockRules.filter(rule => rule.association_id === associationId);
  }

  static async getRule(ruleId: string): Promise<AutomationRule | null> {
    return this.mockRules.find(rule => rule.id === ruleId) || null;
  }

  static async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule | null> {
    const index = this.mockRules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return null;

    this.mockRules[index] = {
      ...this.mockRules[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockRules[index];
  }

  static async deleteRule(ruleId: string): Promise<boolean> {
    const index = this.mockRules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return false;

    this.mockRules.splice(index, 1);
    return true;
  }

  static async executeRule(ruleId: string, context?: any): Promise<RuleExecution> {
    const rule = this.mockRules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    // Simulate rule execution
    await new Promise(resolve => setTimeout(resolve, 100));

    const execution: RuleExecution = {
      id: crypto.randomUUID(),
      rule_id: ruleId,
      status: 'success',
      execution_time: new Date().toISOString(),
      result: { message: 'Rule executed successfully', context }
    };

    // Update rule execution count
    rule.execution_count += 1;
    rule.last_executed = execution.execution_time;

    this.mockExecutions.push(execution);
    return execution;
  }

  static async getRuleExecutions(ruleId: string, limit: number = 50): Promise<RuleExecution[]> {
    return this.mockExecutions
      .filter(exec => exec.rule_id === ruleId)
      .sort((a, b) => new Date(b.execution_time).getTime() - new Date(a.execution_time).getTime())
      .slice(0, limit);
  }

  static async evaluateTrigger(rule: AutomationRule, context: any): Promise<boolean> {
    // Mock trigger evaluation
    switch (rule.trigger_type) {
      case 'schedule':
        return true; // Always trigger for demo
      case 'event':
        return context.event_type === rule.trigger_conditions.event_type;
      case 'condition':
        return Math.random() > 0.5; // Random for demo
      default:
        return false;
    }
  }

  static async processScheduledRules(associationId: string): Promise<RuleExecution[]> {
    const activeRules = this.mockRules.filter(
      rule => rule.association_id === associationId && 
              rule.is_active && 
              rule.trigger_type === 'schedule'
    );

    const executions: RuleExecution[] = [];

    for (const rule of activeRules) {
      try {
        const execution = await this.executeRule(rule.id);
        executions.push(execution);
      } catch (error) {
        console.error(`Failed to execute rule ${rule.id}:`, error);
      }
    }

    return executions;
  }

  static async getRuleStatistics(associationId: string): Promise<any> {
    const rules = this.mockRules.filter(rule => rule.association_id === associationId);
    const executions = this.mockExecutions.filter(
      exec => rules.some(rule => rule.id === exec.rule_id)
    );

    return {
      total_rules: rules.length,
      active_rules: rules.filter(r => r.is_active).length,
      total_executions: executions.length,
      successful_executions: executions.filter(e => e.status === 'success').length,
      failed_executions: executions.filter(e => e.status === 'failed').length,
      avg_execution_time: executions.length > 0 
        ? executions.reduce((sum, exec) => sum + 100, 0) / executions.length 
        : 0
    };
  }
}