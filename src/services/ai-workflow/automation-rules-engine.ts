
import { supabase } from '@/integrations/supabase/client';
import { AutomationRule } from '@/types/ai-workflow-types';
import { intelligentWorkflowEngine } from './intelligent-workflow-engine';
import { devLog } from '@/utils/dev-logger';

export class AutomationRulesEngine {
  private static instance: AutomationRulesEngine;
  private activeRules: Map<string, AutomationRule> = new Map();
  private ruleExecutionQueue: any[] = [];
  private isProcessingQueue = false;
  
  static getInstance(): AutomationRulesEngine {
    if (!AutomationRulesEngine.instance) {
      AutomationRulesEngine.instance = new AutomationRulesEngine();
    }
    return AutomationRulesEngine.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadActiveRules();
      this.startQueueProcessor();
      devLog.info('Automation Rules Engine initialized');
    } catch (error) {
      devLog.error('Failed to initialize Automation Rules Engine', error);
    }
  }

  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationRule> {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;

      // Add to active rules if enabled
      if (data.is_active) {
        this.activeRules.set(data.id, data);
      }

      return data;
    } catch (error) {
      devLog.error('Failed to create automation rule', error);
      throw error;
    }
  }

  async evaluateEvent(eventType: string, eventData: any, associationId: string): Promise<void> {
    try {
      const relevantRules = this.getRelevantRules(eventType, associationId);
      
      for (const rule of relevantRules) {
        if (await this.evaluateRuleConditions(rule, eventData)) {
          await this.queueRuleExecution(rule, eventData);
        }
      }
    } catch (error) {
      devLog.error('Failed to evaluate event for automation rules', error);
    }
  }

  private async loadActiveRules(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      this.activeRules.clear();
      (data || []).forEach(rule => {
        this.activeRules.set(rule.id, rule);
      });

      devLog.info(`Loaded ${this.activeRules.size} active automation rules`);
    } catch (error) {
      devLog.error('Failed to load active rules', error);
    }
  }

  private getRelevantRules(eventType: string, associationId: string): AutomationRule[] {
    const relevantRules: AutomationRule[] = [];
    
    for (const rule of this.activeRules.values()) {
      if (rule.association_id === associationId) {
        const triggerConditions = rule.trigger_conditions;
        
        // Check if rule applies to this event type
        if (this.ruleAppliesToEvent(triggerConditions, eventType)) {
          relevantRules.push(rule);
        }
      }
    }
    
    return relevantRules;
  }

  private ruleAppliesToEvent(triggerConditions: any, eventType: string): boolean {
    if (!triggerConditions.event_types) return false;
    
    const eventTypes = Array.isArray(triggerConditions.event_types) 
      ? triggerConditions.event_types 
      : [triggerConditions.event_types];
    
    return eventTypes.includes(eventType) || eventTypes.includes('*');
  }

  private async evaluateRuleConditions(rule: AutomationRule, eventData: any): Promise<boolean> {
    try {
      const conditions = rule.trigger_conditions.conditions;
      if (!conditions || conditions.length === 0) return true;

      const results = await Promise.all(
        conditions.map((condition: any) => this.evaluateCondition(condition, eventData))
      );

      // Handle logical operators (AND/OR)
      const operator = rule.trigger_conditions.operator || 'AND';
      
      if (operator === 'AND') {
        return results.every(result => result);
      } else if (operator === 'OR') {
        return results.some(result => result);
      }
      
      return results.every(result => result); // Default to AND
    } catch (error) {
      devLog.error(`Failed to evaluate conditions for rule ${rule.id}`, error);
      return false;
    }
  }

  private async evaluateCondition(condition: any, eventData: any): Promise<boolean> {
    const { field, operator, value, data_source } = condition;
    
    let fieldValue: any;
    
    // Get field value based on data source
    switch (data_source) {
      case 'event_data':
        fieldValue = this.getNestedValue(eventData, field);
        break;
      case 'database':
        fieldValue = await this.getDatabaseValue(condition);
        break;
      case 'api':
        fieldValue = await this.getApiValue(condition);
        break;
      case 'time':
        fieldValue = this.getTimeValue(field);
        break;
      default:
        fieldValue = this.getNestedValue(eventData, field);
    }

    return this.compareValues(fieldValue, operator, value);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async getDatabaseValue(condition: any): Promise<any> {
    try {
      const { table, field, filters } = condition.database_config;
      
      let query = supabase.from(table).select(field);
      
      if (filters) {
        filters.forEach((filter: any) => {
          query = query.eq(filter.column, filter.value);
        });
      }

      const { data, error } = await query.single();
      if (error) throw error;
      
      return data?.[field];
    } catch (error) {
      devLog.error('Failed to get database value for condition', error);
      return null;
    }
  }

  private async getApiValue(condition: any): Promise<any> {
    try {
      const { url, method = 'GET', headers = {} } = condition.api_config;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      
      const data = await response.json();
      return this.getNestedValue(data, condition.response_path || '');
    } catch (error) {
      devLog.error('Failed to get API value for condition', error);
      return null;
    }
  }

  private getTimeValue(field: string): any {
    const now = new Date();
    
    switch (field) {
      case 'current_time':
        return now.toISOString();
      case 'current_hour':
        return now.getHours();
      case 'current_day':
        return now.getDay(); // 0 = Sunday
      case 'current_month':
        return now.getMonth() + 1;
      case 'current_year':
        return now.getFullYear();
      case 'is_weekend':
        return now.getDay() === 0 || now.getDay() === 6;
      case 'is_business_hours':
        const hour = now.getHours();
        return hour >= 9 && hour <= 17;
      default:
        return now;
    }
  }

  private compareValues(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'greater_than_or_equal':
        return Number(fieldValue) >= Number(expectedValue);
      case 'less_than_or_equal':
        return Number(fieldValue) <= Number(expectedValue);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(expectedValue).toLowerCase());
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(expectedValue).toLowerCase());
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      case 'is_null':
        return fieldValue === null || fieldValue === undefined;
      case 'is_not_null':
        return fieldValue !== null && fieldValue !== undefined;
      case 'regex':
        return new RegExp(expectedValue).test(String(fieldValue));
      default:
        devLog.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  private async queueRuleExecution(rule: AutomationRule, eventData: any): Promise<void> {
    const executionItem = {
      id: `${rule.id}_${Date.now()}`,
      rule,
      eventData,
      queuedAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    };

    this.ruleExecutionQueue.push(executionItem);
    
    if (!this.isProcessingQueue) {
      this.processExecutionQueue();
    }
  }

  private async processExecutionQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    try {
      while (this.ruleExecutionQueue.length > 0) {
        const executionItem = this.ruleExecutionQueue.shift();
        if (executionItem) {
          await this.executeRule(executionItem);
        }
      }
    } catch (error) {
      devLog.error('Error processing execution queue', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private async executeRule(executionItem: any): Promise<void> {
    try {
      const { rule, eventData } = executionItem;
      const startTime = Date.now();
      
      devLog.info(`Executing automation rule: ${rule.rule_name}`);
      
      const results = [];
      
      // Execute each action in the sequence
      for (let i = 0; i < rule.action_sequence.length; i++) {
        const action = rule.action_sequence[i];
        const actionResult = await this.executeAction(action, eventData, rule);
        results.push(actionResult);
        
        // Stop execution if action failed and marked as critical
        if (!actionResult.success && action.critical) {
          throw new Error(`Critical action failed: ${action.type}`);
        }
      }

      const executionTime = Date.now() - startTime;
      const successCount = results.filter(r => r.success).length;
      const successRate = (successCount / results.length) * 100;

      // Update rule performance stats
      await this.updateRulePerformance(rule.id, {
        execution_time: executionTime,
        success_rate: successRate,
        last_executed: new Date().toISOString()
      });

      // Learn from execution if learning is enabled
      if (rule.learning_enabled) {
        await this.learnFromExecution(rule, eventData, results);
      }

      devLog.info(`Rule execution completed: ${rule.rule_name} (${successCount}/${results.length} actions succeeded)`);
    } catch (error) {
      devLog.error(`Rule execution failed: ${executionItem.rule.rule_name}`, error);
      
      // Retry if not exceeded max attempts
      if (executionItem.attempts < executionItem.maxAttempts) {
        executionItem.attempts++;
        this.ruleExecutionQueue.push(executionItem);
      } else {
        await this.handleRuleExecutionFailure(executionItem.rule, error);
      }
    }
  }

  private async executeAction(action: any, eventData: any, rule: AutomationRule): Promise<any> {
    const actionStartTime = Date.now();
    
    try {
      let result: any = { success: false, data: null };
      
      switch (action.type) {
        case 'send_notification':
          result = await this.executeNotificationAction(action, eventData);
          break;
        case 'create_workflow':
          result = await this.executeWorkflowAction(action, eventData);
          break;
        case 'update_database':
          result = await this.executeDatabaseAction(action, eventData);
          break;
        case 'send_email':
          result = await this.executeEmailAction(action, eventData);
          break;
        case 'api_call':
          result = await this.executeApiCallAction(action, eventData);
          break;
        case 'conditional':
          result = await this.executeConditionalAction(action, eventData, rule);
          break;
        case 'delay':
          result = await this.executeDelayAction(action);
          break;
        case 'trigger_webhook':
          result = await this.executeWebhookAction(action, eventData);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      const executionTime = Date.now() - actionStartTime;
      
      return {
        ...result,
        action_type: action.type,
        execution_time: executionTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      devLog.error(`Action execution failed: ${action.type}`, error);
      return {
        success: false,
        error: error.message,
        action_type: action.type,
        execution_time: Date.now() - actionStartTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeNotificationAction(action: any, eventData: any): Promise<any> {
    const { recipients, message, priority = 'normal' } = action.config;
    
    // This would integrate with the notification system
    devLog.info(`Sending notification to ${recipients.join(', ')}: ${message}`);
    
    return {
      success: true,
      data: {
        recipients_count: recipients.length,
        message_sent: message,
        priority
      }
    };
  }

  private async executeWorkflowAction(action: any, eventData: any): Promise<any> {
    const { workflow_template_id, execution_data = {} } = action.config;
    
    const mergedData = { ...eventData, ...execution_data };
    
    const execution = await intelligentWorkflowEngine.executeWorkflow(
      workflow_template_id,
      eventData.association_id || eventData.associationId,
      mergedData
    );
    
    return {
      success: true,
      data: {
        workflow_execution_id: execution.id,
        template_id: workflow_template_id
      }
    };
  }

  private async executeDatabaseAction(action: any, eventData: any): Promise<any> {
    const { table, operation, data, filters } = action.config;
    
    let query: any;
    
    switch (operation) {
      case 'insert':
        const insertData = this.interpolateVariables(data, eventData);
        query = supabase.from(table).insert(insertData);
        break;
      case 'update':
        const updateData = this.interpolateVariables(data, eventData);
        query = supabase.from(table).update(updateData);
        if (filters) {
          filters.forEach((filter: any) => {
            const value = this.interpolateVariables(filter.value, eventData);
            query = query.eq(filter.column, value);
          });
        }
        break;
      case 'delete':
        query = supabase.from(table).delete();
        if (filters) {
          filters.forEach((filter: any) => {
            const value = this.interpolateVariables(filter.value, eventData);
            query = query.eq(filter.column, value);
          });
        }
        break;
      default:
        throw new Error(`Unknown database operation: ${operation}`);
    }
    
    const { data: result, error } = await query;
    if (error) throw error;
    
    return {
      success: true,
      data: result
    };
  }

  private async executeEmailAction(action: any, eventData: any): Promise<any> {
    const { to, subject, body, template } = action.config;
    
    const interpolatedTo = this.interpolateVariables(to, eventData);
    const interpolatedSubject = this.interpolateVariables(subject, eventData);
    const interpolatedBody = this.interpolateVariables(body, eventData);
    
    // This would integrate with email service
    devLog.info(`Sending email to ${interpolatedTo}: ${interpolatedSubject}`);
    
    return {
      success: true,
      data: {
        recipients: Array.isArray(interpolatedTo) ? interpolatedTo : [interpolatedTo],
        subject: interpolatedSubject,
        template_used: template || 'default'
      }
    };
  }

  private async executeApiCallAction(action: any, eventData: any): Promise<any> {
    const { url, method = 'POST', headers = {}, body } = action.config;
    
    const interpolatedUrl = this.interpolateVariables(url, eventData);
    const interpolatedBody = body ? this.interpolateVariables(body, eventData) : null;
    
    const response = await fetch(interpolatedUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: interpolatedBody ? JSON.stringify(interpolatedBody) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    return {
      success: true,
      data: {
        status: response.status,
        response: responseData
      }
    };
  }

  private async executeConditionalAction(action: any, eventData: any, rule: AutomationRule): Promise<any> {
    const { condition, then_actions, else_actions } = action.config;
    
    const conditionResult = await this.evaluateCondition(condition, eventData);
    const actionsToExecute = conditionResult ? then_actions : else_actions;
    
    if (!actionsToExecute || actionsToExecute.length === 0) {
      return {
        success: true,
        data: {
          condition_result: conditionResult,
          actions_executed: 0
        }
      };
    }
    
    const results = [];
    for (const subAction of actionsToExecute) {
      const result = await this.executeAction(subAction, eventData, rule);
      results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount === results.length,
      data: {
        condition_result: conditionResult,
        actions_executed: results.length,
        successful_actions: successCount
      }
    };
  }

  private async executeDelayAction(action: any): Promise<any> {
    const { duration_ms } = action.config;
    
    await new Promise(resolve => setTimeout(resolve, duration_ms));
    
    return {
      success: true,
      data: {
        delayed_ms: duration_ms
      }
    };
  }

  private async executeWebhookAction(action: any, eventData: any): Promise<any> {
    const { webhook_url, payload, headers = {} } = action.config;
    
    const interpolatedPayload = this.interpolateVariables(payload || eventData, eventData);
    
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(interpolatedPayload)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
    }
    
    return {
      success: true,
      data: {
        webhook_url,
        status: response.status
      }
    };
  }

  private interpolateVariables(template: any, variables: any): any {
    if (typeof template === 'string') {
      return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        return this.getNestedValue(variables, key.trim()) || match;
      });
    } else if (Array.isArray(template)) {
      return template.map(item => this.interpolateVariables(item, variables));
    } else if (typeof template === 'object' && template !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(template)) {
        result[key] = this.interpolateVariables(value, variables);
      }
      return result;
    }
    
    return template;
  }

  private async updateRulePerformance(ruleId: string, metrics: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({
          last_executed: metrics.last_executed,
          execution_count: supabase.sql`execution_count + 1`,
          performance_stats: supabase.sql`
            jsonb_set(
              performance_stats,
              '{execution_times}',
              COALESCE(performance_stats->'execution_times', '[]'::jsonb) || '${metrics.execution_time}'::jsonb
            )
          `,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      if (error) throw error;
    } catch (error) {
      devLog.error('Failed to update rule performance', error);
    }
  }

  private async learnFromExecution(rule: AutomationRule, eventData: any, results: any[]): Promise<void> {
    try {
      // Simple learning algorithm - adjust rule confidence based on success rate
      const successRate = results.filter(r => r.success).length / results.length;
      
      // Update rule's learning metrics
      const learningData = {
        last_execution_success_rate: successRate,
        total_executions: (rule.execution_count || 0) + 1,
        learning_score: this.calculateLearningScore(rule, successRate)
      };

      await supabase
        .from('automation_rules')
        .update({
          performance_stats: {
            ...rule.performance_stats,
            learning: learningData
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', rule.id);

      devLog.info(`Updated learning metrics for rule ${rule.rule_name}`);
    } catch (error) {
      devLog.error('Failed to learn from execution', error);
    }
  }

  private calculateLearningScore(rule: AutomationRule, currentSuccessRate: number): number {
    const previousScore = rule.performance_stats?.learning?.learning_score || 0.5;
    const learningRate = 0.1; // How quickly the rule adapts
    
    // Simple learning formula - adjust based on recent performance
    return previousScore + learningRate * (currentSuccessRate - previousScore);
  }

  private async handleRuleExecutionFailure(rule: AutomationRule, error: any): Promise<void> {
    try {
      // Log the failure
      devLog.error(`Rule execution failed permanently: ${rule.rule_name}`, error);
      
      // Update failure statistics
      await supabase
        .from('automation_rules')
        .update({
          performance_stats: {
            ...rule.performance_stats,
            last_failure: {
              timestamp: new Date().toISOString(),
              error: error.message,
              failure_count: (rule.performance_stats?.failure_count || 0) + 1
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', rule.id);

      // Disable rule if failure rate is too high
      const failureRate = (rule.performance_stats?.failure_count || 0) / (rule.execution_count || 1);
      if (failureRate > 0.5 && rule.execution_count > 10) {
        await this.disableRule(rule.id, 'High failure rate detected');
      }
    } catch (updateError) {
      devLog.error('Failed to handle rule execution failure', updateError);
    }
  }

  private async disableRule(ruleId: string, reason: string): Promise<void> {
    try {
      await supabase
        .from('automation_rules')
        .update({
          is_active: false,
          performance_stats: {
            disabled_reason: reason,
            disabled_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      // Remove from active rules
      this.activeRules.delete(ruleId);
      
      devLog.warn(`Disabled automation rule ${ruleId}: ${reason}`);
    } catch (error) {
      devLog.error('Failed to disable rule', error);
    }
  }

  private startQueueProcessor(): void {
    // Process queue every 5 seconds
    setInterval(() => {
      if (this.ruleExecutionQueue.length > 0 && !this.isProcessingQueue) {
        this.processExecutionQueue();
      }
    }, 5000);
  }

  async getAutomationRules(associationId: string): Promise<AutomationRule[]> {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      devLog.error('Failed to get automation rules', error);
      return [];
    }
  }

  async updateAutomationRule(ruleId: string, updates: Partial<AutomationRule>): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', ruleId);

      if (error) throw error;

      // Update in-memory cache
      if (this.activeRules.has(ruleId)) {
        const currentRule = this.activeRules.get(ruleId)!;
        const updatedRule = { ...currentRule, ...updates };
        
        if (updatedRule.is_active) {
          this.activeRules.set(ruleId, updatedRule);
        } else {
          this.activeRules.delete(ruleId);
        }
      }
    } catch (error) {
      devLog.error('Failed to update automation rule', error);
      throw error;
    }
  }

  async deleteAutomationRule(ruleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      // Remove from active rules
      this.activeRules.delete(ruleId);
    } catch (error) {
      devLog.error('Failed to delete automation rule', error);
      throw error;
    }
  }

  async getExecutionAnalytics(associationId: string): Promise<any> {
    try {
      const rules = await this.getAutomationRules(associationId);
      
      const analytics = {
        total_rules: rules.length,
        active_rules: rules.filter(r => r.is_active).length,
        total_executions: rules.reduce((sum, r) => sum + (r.execution_count || 0), 0),
        average_success_rate: this.calculateAverageSuccessRate(rules),
        most_executed_rule: this.getMostExecutedRule(rules),
        performance_trends: this.getPerformanceTrends(rules),
        recommendations: this.generateOptimizationRecommendations(rules)
      };

      return analytics;
    } catch (error) {
      devLog.error('Failed to get execution analytics', error);
      return {};
    }
  }

  private calculateAverageSuccessRate(rules: AutomationRule[]): number {
    const rulesWithSuccessRate = rules.filter(r => r.success_rate !== undefined);
    if (rulesWithSuccessRate.length === 0) return 0;
    
    const totalSuccessRate = rulesWithSuccessRate.reduce((sum, r) => sum + r.success_rate, 0);
    return totalSuccessRate / rulesWithSuccessRate.length;
  }

  private getMostExecutedRule(rules: AutomationRule[]): any {
    const sortedRules = rules.sort((a, b) => (b.execution_count || 0) - (a.execution_count || 0));
    return sortedRules.length > 0 ? {
      name: sortedRules[0].rule_name,
      executions: sortedRules[0].execution_count || 0
    } : null;
  }

  private getPerformanceTrends(rules: AutomationRule[]): any {
    return {
      high_performing_rules: rules.filter(r => r.success_rate > 90).length,
      low_performing_rules: rules.filter(r => r.success_rate < 50).length,
      rules_with_learning: rules.filter(r => r.learning_enabled).length
    };
  }

  private generateOptimizationRecommendations(rules: AutomationRule[]): string[] {
    const recommendations: string[] = [];
    
    const lowPerformingRules = rules.filter(r => r.success_rate < 70);
    if (lowPerformingRules.length > 0) {
      recommendations.push(`Review ${lowPerformingRules.length} rules with low success rates`);
    }
    
    const disabledRules = rules.filter(r => !r.is_active);
    if (disabledRules.length > 0) {
      recommendations.push(`Investigate ${disabledRules.length} disabled rules for potential re-activation`);
    }
    
    const rulesWithoutLearning = rules.filter(r => !r.learning_enabled);
    if (rulesWithoutLearning.length > rules.length * 0.5) {
      recommendations.push('Enable learning for more rules to improve performance over time');
    }
    
    return recommendations;
  }
}

export const automationRulesEngine = AutomationRulesEngine.getInstance();
