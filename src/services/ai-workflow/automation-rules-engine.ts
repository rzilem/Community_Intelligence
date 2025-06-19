
import { supabase } from '@/integrations/supabase/client';
import { AutomationRule } from '@/types/ai-workflow-types';
import { devLog } from '@/utils/dev-logger';

// Helper function to convert database row to AutomationRule
function convertToAutomationRule(row: any): AutomationRule {
  return {
    id: row.id,
    association_id: row.association_id,
    rule_name: row.rule_name,
    rule_type: row.rule_type,
    trigger_conditions: typeof row.trigger_conditions === 'string' 
      ? JSON.parse(row.trigger_conditions) 
      : row.trigger_conditions || {},
    action_sequence: typeof row.action_sequence === 'string'
      ? JSON.parse(row.action_sequence)
      : row.action_sequence || [],
    is_active: row.is_active,
    learning_enabled: row.learning_enabled,
    performance_stats: typeof row.performance_stats === 'string'
      ? JSON.parse(row.performance_stats)
      : row.performance_stats || {},
    last_executed: row.last_executed,
    execution_count: row.execution_count,
    success_rate: row.success_rate,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export class AutomationRulesEngine {
  private rules: Map<string, AutomationRule> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      devLog.info('Initializing Automation Rules Engine...');
      await this.loadActiveRules();
      this.isInitialized = true;
      devLog.info('Automation Rules Engine initialized successfully');
    } catch (error) {
      devLog.error('Failed to initialize Automation Rules Engine', error);
      throw error;
    }
  }

  private async loadActiveRules(): Promise<void> {
    const { data: rulesData, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to load automation rules: ${error.message}`);
    }

    if (rulesData) {
      this.rules.clear();
      rulesData.forEach(row => {
        const rule = convertToAutomationRule(row);
        this.rules.set(rule.id, rule);
      });
      devLog.info(`Loaded ${this.rules.size} active automation rules`);
    }
  }

  async createRule(ruleData: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert({
        association_id: ruleData.association_id,
        rule_name: ruleData.rule_name,
        rule_type: ruleData.rule_type,
        trigger_conditions: ruleData.trigger_conditions,
        action_sequence: ruleData.action_sequence,
        is_active: ruleData.is_active,
        learning_enabled: ruleData.learning_enabled,
        performance_stats: ruleData.performance_stats,
        execution_count: ruleData.execution_count || 0,
        success_rate: ruleData.success_rate || 100,
        created_by: ruleData.created_by
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create automation rule: ${error.message}`);
    }

    const rule = convertToAutomationRule(data);
    this.rules.set(rule.id, rule);
    return rule;
  }

  async evaluateEvent(eventType: string, eventData: any, associationId: string): Promise<void> {
    if (!this.isInitialized) {
      devLog.warn('Automation Rules Engine not initialized, skipping event evaluation');
      return;
    }

    const relevantRules = Array.from(this.rules.values()).filter(rule => 
      rule.association_id === associationId && rule.is_active
    );

    devLog.info(`Evaluating ${relevantRules.length} rules for event: ${eventType}`);

    for (const rule of relevantRules) {
      try {
        if (await this.evaluateRule(rule, eventType, eventData)) {
          await this.executeRule(rule, eventData);
        }
      } catch (error) {
        devLog.error(`Error evaluating rule ${rule.id}`, error);
        await this.updateRulePerformance(rule.id, false);
      }
    }
  }

  private async evaluateRule(rule: AutomationRule, eventType: string, eventData: any): Promise<boolean> {
    const conditions = rule.trigger_conditions;
    
    // Simple condition matching - can be enhanced with more complex logic
    if (conditions.event_type && conditions.event_type !== eventType) {
      return false;
    }

    if (conditions.property_filters) {
      for (const [key, expectedValue] of Object.entries(conditions.property_filters)) {
        if (eventData[key] !== expectedValue) {
          return false;
        }
      }
    }

    return true;
  }

  private async executeRule(rule: AutomationRule, eventData: any): Promise<void> {
    devLog.info(`Executing rule: ${rule.rule_name}`);

    try {
      for (const action of rule.action_sequence) {
        await this.executeAction(action, eventData, rule.association_id);
      }

      await this.updateRulePerformance(rule.id, true);
      devLog.info(`Successfully executed rule: ${rule.rule_name}`);
    } catch (error) {
      await this.updateRulePerformance(rule.id, false);
      throw error;
    }
  }

  private async executeAction(action: any, eventData: any, associationId: string): Promise<void> {
    switch (action.type) {
      case 'send_notification':
        await this.sendNotification(action.config, eventData, associationId);
        break;
      case 'create_task':
        await this.createTask(action.config, eventData, associationId);
        break;
      case 'update_status':
        await this.updateStatus(action.config, eventData);
        break;
      case 'trigger_workflow':
        await this.triggerWorkflow(action.config, eventData, associationId);
        break;
      default:
        devLog.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async sendNotification(config: any, eventData: any, associationId: string): Promise<void> {
    // Implementation for sending notifications
    devLog.info('Sending notification', { config, eventData, associationId });
  }

  private async createTask(config: any, eventData: any, associationId: string): Promise<void> {
    // Implementation for creating tasks
    devLog.info('Creating task', { config, eventData, associationId });
  }

  private async updateStatus(config: any, eventData: any): Promise<void> {
    // Implementation for updating statuses
    devLog.info('Updating status', { config, eventData });
  }

  private async triggerWorkflow(config: any, eventData: any, associationId: string): Promise<void> {
    // Implementation for triggering workflows
    devLog.info('Triggering workflow', { config, eventData, associationId });
  }

  private async updateRulePerformance(ruleId: string, success: boolean): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    const newExecutionCount = rule.execution_count + 1;
    const successCount = success 
      ? Math.round(rule.execution_count * (rule.success_rate / 100)) + 1
      : Math.round(rule.execution_count * (rule.success_rate / 100));
    
    const newSuccessRate = (successCount / newExecutionCount) * 100;

    const { error } = await supabase
      .from('automation_rules')
      .update({
        execution_count: newExecutionCount,
        success_rate: newSuccessRate,
        last_executed: new Date().toISOString(),
        performance_stats: {
          ...rule.performance_stats,
          last_success: success,
          last_execution: new Date().toISOString()
        }
      })
      .eq('id', ruleId);

    if (error) {
      devLog.error(`Failed to update rule performance for ${ruleId}`, error);
    } else {
      // Update local cache
      rule.execution_count = newExecutionCount;
      rule.success_rate = newSuccessRate;
      rule.last_executed = new Date().toISOString();
    }
  }

  async getRulesByAssociation(associationId: string): Promise<AutomationRule[]> {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch automation rules: ${error.message}`);
    }

    return data ? data.map(convertToAutomationRule) : [];
  }

  async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from('automation_rules')
      .update(updates)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update automation rule: ${error.message}`);
    }

    const rule = convertToAutomationRule(data);
    this.rules.set(rule.id, rule);
    return rule;
  }

  async deleteRule(ruleId: string): Promise<void> {
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      throw new Error(`Failed to delete automation rule: ${error.message}`);
    }

    this.rules.delete(ruleId);
  }

  async getPerformanceMetrics(associationId: string): Promise<any> {
    const rules = await this.getRulesByAssociation(associationId);
    
    const metrics = {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.is_active).length,
      totalExecutions: rules.reduce((sum, r) => sum + r.execution_count, 0),
      averageSuccessRate: rules.length > 0 
        ? rules.reduce((sum, r) => sum + r.success_rate, 0) / rules.length 
        : 0,
      rulesWithLearning: rules.filter(r => r.learning_enabled).length
    };

    return metrics;
  }
}

export const automationRulesEngine = new AutomationRulesEngine();
