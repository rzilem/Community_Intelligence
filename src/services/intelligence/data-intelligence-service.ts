// Data Intelligence & Automation Service for Phase 3

import { supabase } from '@/integrations/supabase/client';

export interface DocumentCategory {
  id: string;
  name: string;
  keywords: string[];
  patterns: string[];
  confidence_threshold: number;
}

export interface MaintenancePrediction {
  id: string;
  association_id: string;
  asset_type: string;
  predicted_issue: string;
  probability: number;
  predicted_date: string;
  recommended_action: string;
  cost_estimate?: number;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface FinancialForecast {
  id: string;
  association_id: string;
  period: string;
  forecasted_revenue: number;
  forecasted_expenses: number;
  predicted_cash_flow: number;
  confidence_level: number;
  factors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  created_at: string;
}

export interface ComplianceAlert {
  id: string;
  association_id: string;
  regulation_type: string;
  requirement: string;
  due_date: string;
  status: 'upcoming' | 'overdue' | 'completed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommended_actions: string[];
  responsible_party?: string;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_conditions: Record<string, any>;
  actions: Array<{
    type: string;
    parameters: Record<string, any>;
  }>;
  is_active: boolean;
  last_executed?: string;
  execution_count: number;
  created_at: string;
}

export class DataIntelligenceService {
  // Document Processing Intelligence
  async categorizeDocument(
    content: string, 
    fileName: string, 
    associationId: string
  ): Promise<{ category: string; confidence: number; suggestions: string[] }> {
    const categories = await this.getDocumentCategories(associationId);
    
    let bestMatch = { category: 'general', confidence: 0, suggestions: [] };
    
    for (const category of categories) {
      const confidence = this.calculateCategoryConfidence(content, fileName, category);
      
      if (confidence > bestMatch.confidence && confidence >= category.confidence_threshold) {
        bestMatch = {
          category: category.name,
          confidence,
          suggestions: this.generateCategorySuggestions(content, category)
        };
      }
    }

    // Log categorization for learning
    await this.logCategorization(associationId, fileName, content, bestMatch);

    return bestMatch;
  }

  private async getDocumentCategories(associationId: string): Promise<DocumentCategory[]> {
    const { data } = await supabase
      .from('document_categories')
      .select('*')
      .eq('association_id', associationId);

    return data || this.getDefaultCategories();
  }

  private getDefaultCategories(): DocumentCategory[] {
    return [
      {
        id: 'financial',
        name: 'Financial',
        keywords: ['budget', 'invoice', 'payment', 'financial', 'expense', 'revenue', 'accounting'],
        patterns: ['/budget/', '/invoice/', '/payment/'],
        confidence_threshold: 0.7
      },
      {
        id: 'legal',
        name: 'Legal',
        keywords: ['contract', 'agreement', 'legal', 'violation', 'compliance', 'policy', 'ccr'],
        patterns: ['/contract/', '/legal/', '/policy/'],
        confidence_threshold: 0.8
      },
      {
        id: 'maintenance',
        name: 'Maintenance',
        keywords: ['maintenance', 'repair', 'work order', 'inspection', 'service', 'vendor'],
        patterns: ['/maintenance/', '/repair/', '/service/'],
        confidence_threshold: 0.7
      },
      {
        id: 'meeting',
        name: 'Meeting',
        keywords: ['meeting', 'minutes', 'agenda', 'board', 'committee', 'discussion'],
        patterns: ['/meeting/', '/minutes/', '/agenda/'],
        confidence_threshold: 0.8
      }
    ];
  }

  private calculateCategoryConfidence(
    content: string, 
    fileName: string, 
    category: DocumentCategory
  ): number {
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();
    
    let score = 0;
    let totalChecks = 0;

    // Check keywords in content
    for (const keyword of category.keywords) {
      totalChecks++;
      if (lowerContent.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    // Check patterns in filename
    for (const pattern of category.patterns) {
      totalChecks++;
      if (lowerFileName.includes(pattern.replace(/\//g, ''))) {
        score += 1.5; // Filename patterns are more reliable
      }
    }

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  private generateCategorySuggestions(content: string, category: DocumentCategory): string[] {
    const suggestions = [];
    
    switch (category.name) {
      case 'Financial':
        if (content.includes('budget')) suggestions.push('Budget Document');
        if (content.includes('invoice')) suggestions.push('Invoice/Bill');
        if (content.includes('payment')) suggestions.push('Payment Record');
        break;
      case 'Legal':
        if (content.includes('contract')) suggestions.push('Service Contract');
        if (content.includes('violation')) suggestions.push('Violation Notice');
        if (content.includes('policy')) suggestions.push('Policy Document');
        break;
      case 'Maintenance':
        if (content.includes('work order')) suggestions.push('Work Order');
        if (content.includes('inspection')) suggestions.push('Inspection Report');
        if (content.includes('vendor')) suggestions.push('Vendor Document');
        break;
    }

    return suggestions.length > 0 ? suggestions : ['General Document'];
  }

  private async logCategorization(
    associationId: string,
    fileName: string,
    content: string,
    result: any
  ): Promise<void> {
    await supabase
      .from('document_categorization_log')
      .insert({
        association_id: associationId,
        file_name: fileName,
        content_sample: content.substring(0, 500),
        predicted_category: result.category,
        confidence: result.confidence,
        created_at: new Date().toISOString()
      });
  }

  // Predictive Maintenance
  async generateMaintenancePredictions(associationId: string): Promise<MaintenancePrediction[]> {
    // Get historical maintenance data
    const { data: maintenanceHistory } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('association_id', associationId)
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (!maintenanceHistory || maintenanceHistory.length < 5) {
      return []; // Need more data for predictions
    }

    const predictions = this.analyzeMaintenancePatterns(maintenanceHistory);
    
    // Store predictions
    for (const prediction of predictions) {
      await supabase
        .from('maintenance_predictions')
        .upsert({
          ...prediction,
          association_id: associationId
        });
    }

    return predictions;
  }

  private analyzeMaintenancePatterns(history: any[]): MaintenancePrediction[] {
    const predictions: MaintenancePrediction[] = [];
    const assetTypes = new Map<string, any[]>();

    // Group by asset type
    history.forEach(request => {
      const assetType = request.category || 'general';
      if (!assetTypes.has(assetType)) {
        assetTypes.set(assetType, []);
      }
      assetTypes.get(assetType)!.push(request);
    });

    // Analyze patterns for each asset type
    assetTypes.forEach((requests, assetType) => {
      const pattern = this.findMaintenancePattern(requests);
      if (pattern.probability > 0.6) {
        predictions.push({
          id: crypto.randomUUID(),
          association_id: '',
          asset_type: assetType,
          predicted_issue: pattern.issue,
          probability: pattern.probability,
          predicted_date: pattern.predictedDate,
          recommended_action: pattern.recommendedAction,
          cost_estimate: pattern.estimatedCost,
          urgency: pattern.urgency,
          created_at: new Date().toISOString()
        });
      }
    });

    return predictions;
  }

  private findMaintenancePattern(requests: any[]): any {
    // Simple pattern analysis - could be enhanced with ML
    const avgInterval = this.calculateAverageInterval(requests);
    const lastRequest = requests[requests.length - 1];
    const daysSinceLastRequest = Math.floor(
      (Date.now() - new Date(lastRequest.created_at).getTime()) / (24 * 60 * 60 * 1000)
    );

    const probabilityFactor = Math.min(daysSinceLastRequest / avgInterval, 1);
    
    return {
      issue: this.predictIssueType(requests),
      probability: Math.min(probabilityFactor * 0.8 + 0.2, 0.95),
      predictedDate: new Date(Date.now() + (avgInterval - daysSinceLastRequest) * 24 * 60 * 60 * 1000).toISOString(),
      recommendedAction: this.generateRecommendedAction(requests),
      estimatedCost: this.estimateCost(requests),
      urgency: probabilityFactor > 0.8 ? 'high' : probabilityFactor > 0.6 ? 'medium' : 'low'
    };
  }

  private calculateAverageInterval(requests: any[]): number {
    if (requests.length < 2) return 365; // Default to yearly

    const intervals = [];
    for (let i = 1; i < requests.length; i++) {
      const interval = Math.floor(
        (new Date(requests[i].created_at).getTime() - new Date(requests[i-1].created_at).getTime()) 
        / (24 * 60 * 60 * 1000)
      );
      intervals.push(interval);
    }

    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  private predictIssueType(requests: any[]): string {
    const issueFrequency = new Map<string, number>();
    
    requests.forEach(request => {
      const description = request.description?.toLowerCase() || '';
      if (description.includes('hvac') || description.includes('air conditioning')) {
        issueFrequency.set('HVAC System', (issueFrequency.get('HVAC System') || 0) + 1);
      } else if (description.includes('plumb') || description.includes('water')) {
        issueFrequency.set('Plumbing', (issueFrequency.get('Plumbing') || 0) + 1);
      } else if (description.includes('electric') || description.includes('light')) {
        issueFrequency.set('Electrical', (issueFrequency.get('Electrical') || 0) + 1);
      } else {
        issueFrequency.set('General Maintenance', (issueFrequency.get('General Maintenance') || 0) + 1);
      }
    });

    let mostFrequent = 'General Maintenance';
    let maxCount = 0;
    
    issueFrequency.forEach((count, issue) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = issue;
      }
    });

    return mostFrequent;
  }

  private generateRecommendedAction(requests: any[]): string {
    const lastRequest = requests[requests.length - 1];
    const description = lastRequest.description?.toLowerCase() || '';
    
    if (description.includes('hvac')) {
      return 'Schedule HVAC system inspection and filter replacement';
    } else if (description.includes('plumb')) {
      return 'Conduct plumbing inspection and check for leaks';
    } else if (description.includes('electric')) {
      return 'Schedule electrical system safety inspection';
    } else {
      return 'Schedule preventive maintenance inspection';
    }
  }

  private estimateCost(requests: any[]): number {
    // Calculate average cost from previous similar requests
    const costsWithValues = requests
      .map(r => r.cost || r.budget || 0)
      .filter(cost => cost > 0);
    
    if (costsWithValues.length === 0) return 500; // Default estimate
    
    const averageCost = costsWithValues.reduce((sum, cost) => sum + cost, 0) / costsWithValues.length;
    return Math.round(averageCost * 1.1); // Add 10% inflation factor
  }

  // Financial Forecasting
  async generateFinancialForecast(
    associationId: string, 
    months: number = 12
  ): Promise<FinancialForecast> {
    // Get historical financial data
    const { data: financialHistory } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('association_id', associationId)
      .gte('created_at', new Date(Date.now() - 24 * 30 * 24 * 60 * 60 * 1000).toISOString());

    const forecast = this.calculateFinancialProjection(financialHistory || [], months);

    // Store forecast
    const { data } = await supabase
      .from('financial_forecasts')
      .insert({
        association_id: associationId,
        period: `${months}_months`,
        forecasted_revenue: forecast.revenue,
        forecasted_expenses: forecast.expenses,
        predicted_cash_flow: forecast.cashFlow,
        confidence_level: forecast.confidence,
        factors: forecast.factors
      })
      .select()
      .single();

    return data;
  }

  private calculateFinancialProjection(history: any[], months: number): any {
    const monthlyRevenue = this.calculateMonthlyAverage(history, 'revenue');
    const monthlyExpenses = this.calculateMonthlyAverage(history, 'expenses');
    
    const seasonalityFactor = this.calculateSeasonality(history);
    const trendFactor = this.calculateTrend(history);

    const projectedRevenue = monthlyRevenue * months * (1 + trendFactor) * seasonalityFactor;
    const projectedExpenses = monthlyExpenses * months * (1 + trendFactor * 0.5);

    return {
      revenue: Math.round(projectedRevenue),
      expenses: Math.round(projectedExpenses),
      cashFlow: Math.round(projectedRevenue - projectedExpenses),
      confidence: history.length >= 12 ? 0.85 : 0.65,
      factors: [
        {
          name: 'Historical Trend',
          impact: trendFactor,
          description: `${trendFactor > 0 ? 'Positive' : 'Negative'} trend based on historical data`
        },
        {
          name: 'Seasonality',
          impact: seasonalityFactor - 1,
          description: 'Seasonal variation adjustment'
        }
      ]
    };
  }

  private calculateMonthlyAverage(history: any[], type: 'revenue' | 'expenses'): number {
    if (history.length === 0) return 0;

    const monthlyTotals = new Map<string, number>();
    
    history.forEach(transaction => {
      const month = new Date(transaction.created_at).toISOString().substring(0, 7);
      const amount = type === 'revenue' ? 
        (transaction.amount > 0 ? transaction.amount : 0) :
        (transaction.amount < 0 ? Math.abs(transaction.amount) : 0);
      
      monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + amount);
    });

    const totals = Array.from(monthlyTotals.values());
    return totals.reduce((sum, total) => sum + total, 0) / totals.length;
  }

  private calculateSeasonality(history: any[]): number {
    // Simple seasonality calculation - could be enhanced
    const currentMonth = new Date().getMonth();
    
    // Basic seasonal adjustments (this would be more sophisticated in reality)
    const seasonalFactors = [0.9, 0.9, 1.0, 1.1, 1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.0, 0.9];
    return seasonalFactors[currentMonth];
  }

  private calculateTrend(history: any[]): number {
    if (history.length < 6) return 0;

    // Simple linear trend calculation
    const monthlyTotals = this.getMonthlyTotals(history);
    if (monthlyTotals.length < 6) return 0;

    const firstHalf = monthlyTotals.slice(0, Math.floor(monthlyTotals.length / 2));
    const secondHalf = monthlyTotals.slice(Math.floor(monthlyTotals.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    return secondAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
  }

  private getMonthlyTotals(history: any[]): number[] {
    const monthlyTotals = new Map<string, number>();
    
    history.forEach(transaction => {
      const month = new Date(transaction.created_at).toISOString().substring(0, 7);
      monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + Math.abs(transaction.amount));
    });

    return Array.from(monthlyTotals.values()).sort();
  }

  // Compliance Monitoring
  async generateComplianceAlerts(associationId: string): Promise<ComplianceAlert[]> {
    const complianceRequirements = await this.getComplianceRequirements(associationId);
    const alerts: ComplianceAlert[] = [];

    for (const requirement of complianceRequirements) {
      const daysUntilDue = Math.floor(
        (new Date(requirement.due_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      let urgency: ComplianceAlert['urgency'] = 'low';
      if (daysUntilDue < 0) urgency = 'critical';
      else if (daysUntilDue <= 7) urgency = 'high';
      else if (daysUntilDue <= 30) urgency = 'medium';

      if (urgency !== 'low') {
        alerts.push({
          id: crypto.randomUUID(),
          association_id: associationId,
          regulation_type: requirement.type,
          requirement: requirement.description,
          due_date: requirement.due_date,
          status: daysUntilDue < 0 ? 'overdue' : 'upcoming',
          urgency,
          recommended_actions: requirement.actions,
          responsible_party: requirement.responsible_party,
          created_at: new Date().toISOString()
        });
      }
    }

    // Store alerts
    for (const alert of alerts) {
      await supabase
        .from('compliance_alerts')
        .upsert(alert);
    }

    return alerts;
  }

  private async getComplianceRequirements(associationId: string): Promise<any[]> {
    // This would typically come from a compliance requirements database
    // For now, return some common HOA compliance requirements
    return [
      {
        type: 'Financial',
        description: 'Annual Financial Audit',
        due_date: new Date(new Date().getFullYear(), 11, 31).toISOString(),
        actions: ['Schedule auditor', 'Prepare financial records', 'Board review'],
        responsible_party: 'Treasurer'
      },
      {
        type: 'Insurance',
        description: 'Property Insurance Renewal',
        due_date: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
        actions: ['Review coverage', 'Get quotes', 'Board approval'],
        responsible_party: 'Property Manager'
      },
      {
        type: 'Legal',
        description: 'Board Meeting Minutes Filing',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        actions: ['Complete meeting minutes', 'Board approval', 'File with state'],
        responsible_party: 'Secretary'
      }
    ];
  }

  // Automation Rules
  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'created_at' | 'execution_count'>): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert({
        ...rule,
        execution_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async executeAutomationRules(associationId: string, triggerType: string, triggerData: any): Promise<void> {
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('association_id', associationId)
      .eq('trigger_type', triggerType)
      .eq('is_active', true);

    if (!rules) return;

    for (const rule of rules) {
      if (this.evaluateConditions(triggerData, rule.trigger_conditions)) {
        await this.executeRuleActions(rule, triggerData);
        
        // Update execution count
        await supabase
          .from('automation_rules')
          .update({
            execution_count: rule.execution_count + 1,
            last_executed: new Date().toISOString()
          })
          .eq('id', rule.id);
      }
    }
  }

  private evaluateConditions(data: any, conditions: Record<string, any>): boolean {
    // Simple condition evaluation - could be enhanced with more operators
    for (const [field, expectedValue] of Object.entries(conditions)) {
      const actualValue = this.getFieldValue(data, field);
      if (actualValue !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  private getFieldValue(data: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  private async executeRuleActions(rule: AutomationRule, triggerData: any): Promise<void> {
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, triggerData, rule.association_id);
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  private async executeAction(action: any, triggerData: any, associationId: string): Promise<void> {
    switch (action.type) {
      case 'send_notification':
        await this.sendAutomatedNotification(action.parameters, triggerData, associationId);
        break;
      case 'create_task':
        await this.createAutomatedTask(action.parameters, triggerData, associationId);
        break;
      case 'update_status':
        await this.updateRecordStatus(action.parameters, triggerData);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async sendAutomatedNotification(params: any, triggerData: any, associationId: string): Promise<void> {
    // Implementation would depend on notification service
    console.log('Sending automated notification:', params, triggerData);
  }

  private async createAutomatedTask(params: any, triggerData: any, associationId: string): Promise<void> {
    await supabase
      .from('tasks')
      .insert({
        association_id: associationId,
        title: params.title,
        description: params.description,
        assigned_to: params.assigned_to,
        due_date: params.due_date,
        status: 'pending',
        created_by: 'automation'
      });
  }

  private async updateRecordStatus(params: any, triggerData: any): Promise<void> {
    await supabase
      .from(params.table)
      .update({ status: params.new_status })
      .eq('id', triggerData.record_id);
  }
}

export const dataIntelligenceService = new DataIntelligenceService();