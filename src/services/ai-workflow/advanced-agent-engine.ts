import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface AgentTask {
  id: string;
  type: 'analysis' | 'decision' | 'action' | 'communication';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  context: Record<string, any>;
  result?: any;
  reasoning?: string[];
  confidence: number;
}

export interface AgentChain {
  id: string;
  name: string;
  associationId: string;
  tasks: AgentTask[];
  currentTaskIndex: number;
  status: 'running' | 'completed' | 'failed' | 'paused';
  metadata: Record<string, any>;
}

export class AdvancedAgentEngine {
  private activeChains: Map<string, AgentChain> = new Map();
  private taskExecutors: Map<string, (task: AgentTask) => Promise<any>> = new Map();

  constructor() {
    this.initializeTaskExecutors();
  }

  private initializeTaskExecutors() {
    // Analysis tasks
    this.taskExecutors.set('financial_analysis', this.executeFinancialAnalysis.bind(this));
    this.taskExecutors.set('compliance_check', this.executeComplianceCheck.bind(this));
    this.taskExecutors.set('maintenance_assessment', this.executeMaintenanceAssessment.bind(this));
    this.taskExecutors.set('document_classification', this.executeDocumentClassification.bind(this));

    // Decision tasks
    this.taskExecutors.set('budget_recommendation', this.executeBudgetRecommendation.bind(this));
    this.taskExecutors.set('vendor_selection', this.executeVendorSelection.bind(this));
    this.taskExecutors.set('violation_assessment', this.executeViolationAssessment.bind(this));

    // Action tasks
    this.taskExecutors.set('generate_notice', this.executeGenerateNotice.bind(this));
    this.taskExecutors.set('schedule_maintenance', this.executeScheduleMaintenance.bind(this));
    this.taskExecutors.set('create_report', this.executeCreateReport.bind(this));
    this.taskExecutors.set('update_records', this.executeUpdateRecords.bind(this));

    // Communication tasks
    this.taskExecutors.set('send_notification', this.executeSendNotification.bind(this));
    this.taskExecutors.set('escalate_issue', this.executeEscalateIssue.bind(this));
    this.taskExecutors.set('resident_outreach', this.executeResidentOutreach.bind(this));
  }

  async createAgentChain(
    name: string,
    associationId: string,
    tasks: Omit<AgentTask, 'id' | 'status'>[]
  ): Promise<AgentChain> {
    const chainId = `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agentTasks: AgentTask[] = tasks.map((task, index) => ({
      ...task,
      id: `task_${chainId}_${index}`,
      status: 'pending'
    }));

    const chain: AgentChain = {
      id: chainId,
      name,
      associationId,
      tasks: agentTasks,
      currentTaskIndex: 0,
      status: 'running',
      metadata: {
        createdAt: new Date().toISOString(),
        totalTasks: agentTasks.length
      }
    };

    this.activeChains.set(chainId, chain);
    
    // Store in database
    await this.persistChain(chain);
    
    // Start execution
    this.executeChain(chainId);
    
    return chain;
  }

  private async executeChain(chainId: string): Promise<void> {
    const chain = this.activeChains.get(chainId);
    if (!chain) return;

    try {
      while (chain.currentTaskIndex < chain.tasks.length && chain.status === 'running') {
        const currentTask = chain.tasks[chain.currentTaskIndex];
        
        // Check dependencies
        if (!this.areDependenciesMet(currentTask, chain.tasks)) {
          devLog.warn(`Dependencies not met for task ${currentTask.id}`);
          await this.waitForDependencies(currentTask, chain);
          continue;
        }

        // Execute task
        await this.executeTask(currentTask, chain);
        
        // Move to next task
        chain.currentTaskIndex++;
        
        // Update chain in database
        await this.persistChain(chain);
      }

      // Mark chain as completed
      chain.status = 'completed';
      chain.metadata.completedAt = new Date().toISOString();
      await this.persistChain(chain);
      
      devLog.info(`Agent chain ${chainId} completed successfully`);
    } catch (error) {
      chain.status = 'failed';
      chain.metadata.error = error instanceof Error ? error.message : 'Unknown error';
      await this.persistChain(chain);
      devLog.error(`Agent chain ${chainId} failed:`, error);
    }
  }

  private async executeTask(task: AgentTask, chain: AgentChain): Promise<void> {
    task.status = 'in_progress';
    task.reasoning = [`Starting execution of ${task.type} task: ${task.description}`];
    
    devLog.info(`Executing task ${task.id} in chain ${chain.id}`);

    try {
      const executor = this.taskExecutors.get(task.type);
      if (!executor) {
        throw new Error(`No executor found for task type: ${task.type}`);
      }

      // Add chain context to task
      task.context.chainId = chain.id;
      task.context.associationId = chain.associationId;
      task.context.previousTasks = chain.tasks.slice(0, chain.currentTaskIndex);

      const result = await executor(task);
      
      task.result = result;
      task.status = 'completed';
      task.reasoning?.push(`Task completed successfully with result: ${JSON.stringify(result, null, 2)}`);
      
      devLog.info(`Task ${task.id} completed successfully`);
    } catch (error) {
      task.status = 'failed';
      task.result = { error: error instanceof Error ? error.message : 'Unknown error' };
      task.reasoning?.push(`Task failed with error: ${task.result.error}`);
      
      devLog.error(`Task ${task.id} failed:`, error);
      throw error;
    }
  }

  private areDependenciesMet(task: AgentTask, allTasks: AgentTask[]): boolean {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask && depTask.status === 'completed';
    });
  }

  private async waitForDependencies(task: AgentTask, chain: AgentChain): Promise<void> {
    // In a real implementation, this would use a more sophisticated waiting mechanism
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Task Executors
  private async executeFinancialAnalysis(task: AgentTask): Promise<any> {
    const { property_id, period } = task.context;
    
    // Fetch financial data
    const { data: assessments } = await supabase
      .from('assessments')
      .select('*')
      .eq('property_id', property_id);

    const { data: payments } = await supabase
      .from('payment_transactions_enhanced')
      .select('*')
      .eq('property_id', property_id);

    // Perform analysis
    const totalAssessments = assessments?.reduce((sum, a) => sum + Number(a.amount), 0) || 0;
    const totalPayments = payments?.reduce((sum, p) => sum + Number(p.net_amount), 0) || 0;
    const balance = totalAssessments - totalPayments;

    const analysis = {
      totalAssessments,
      totalPayments,
      currentBalance: balance,
      paymentTrend: this.calculatePaymentTrend(payments || []),
      riskLevel: balance > 1000 ? 'high' : balance > 500 ? 'medium' : 'low',
      recommendations: this.generateFinancialRecommendations(balance, payments || [])
    };

    task.confidence = 0.9;
    return analysis;
  }

  private async executeComplianceCheck(task: AgentTask): Promise<any> {
    const { property_id, compliance_type } = task.context;
    
    // Check compliance issues
    const { data: issues } = await supabase
      .from('compliance_issues')
      .select('*')
      .eq('property_id', property_id)
      .eq('status', 'open');

    const compliance = {
      totalIssues: issues?.length || 0,
      criticalIssues: issues?.filter(i => i.severity === 'critical').length || 0,
      complianceScore: this.calculateComplianceScore(issues || []),
      nextActions: this.generateComplianceActions(issues || [])
    };

    task.confidence = 0.95;
    return compliance;
  }

  private async executeMaintenanceAssessment(task: AgentTask): Promise<any> {
    const { property_id } = task.context;
    
    // Fetch maintenance data
    const { data: requests } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('property_id', property_id);

    const assessment = {
      totalRequests: requests?.length || 0,
      urgentRequests: requests?.filter(r => r.priority === 'urgent').length || 0,
      averageResolutionTime: this.calculateAverageResolutionTime(requests || []),
      maintenanceScore: this.calculateMaintenanceScore(requests || []),
      predictedIssues: this.predictMaintenanceIssues(requests || [])
    };

    task.confidence = 0.85;
    return assessment;
  }

  private async executeDocumentClassification(task: AgentTask): Promise<any> {
    const { document_id } = task.context;
    
    // Get document data
    const { data: document } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (!document) {
      throw new Error('Document not found');
    }

    // Classify document (simplified)
    const classification = {
      type: this.classifyDocumentType(document.name, document.file_type),
      confidence: 0.88,
      extractedData: this.extractDocumentData(document),
      suggestedActions: this.suggestDocumentActions(document)
    };

    task.confidence = classification.confidence;
    return classification;
  }

  private async executeBudgetRecommendation(task: AgentTask): Promise<any> {
    const { association_id, budget_period } = task.context;
    
    // Analyze previous financial data
    const previousTasks = task.context.previousTasks || [];
    const financialAnalysis = previousTasks.find(t => t.type === 'analysis' && t.result)?.result;

    const recommendation = {
      recommendedBudget: this.calculateRecommendedBudget(financialAnalysis),
      budgetBreakdown: this.createBudgetBreakdown(financialAnalysis),
      riskFactors: this.identifyBudgetRisks(financialAnalysis),
      confidence: 0.82
    };

    task.confidence = recommendation.confidence;
    return recommendation;
  }

  private async executeVendorSelection(task: AgentTask): Promise<any> {
    const { service_type, budget_range } = task.context;
    
    // Fetch available vendors
    const { data: vendors } = await supabase
      .from('vendors')
      .select('*')
      .contains('services', [service_type]);

    const selection = {
      recommendedVendors: this.rankVendors(vendors || [], budget_range),
      selectionCriteria: this.getVendorSelectionCriteria(),
      riskAssessment: this.assessVendorRisks(vendors || [])
    };

    task.confidence = 0.87;
    return selection;
  }

  private async executeViolationAssessment(task: AgentTask): Promise<any> {
    const { property_id, violation_data } = task.context;
    
    const assessment = {
      violationSeverity: this.assessViolationSeverity(violation_data),
      recommendedAction: this.recommendViolationAction(violation_data),
      escalationPath: this.defineEscalationPath(violation_data),
      legalRisk: this.assessLegalRisk(violation_data)
    };

    task.confidence = 0.91;
    return assessment;
  }

  // Action executors
  private async executeGenerateNotice(task: AgentTask): Promise<any> {
    const { notice_type, recipient_id, template_data } = task.context;
    
    // Generate notice content
    const notice = {
      id: `notice_${Date.now()}`,
      type: notice_type,
      content: this.generateNoticeContent(notice_type, template_data),
      recipientId: recipient_id,
      createdAt: new Date().toISOString()
    };

    // Store notice
    await supabase
      .from('notices')
      .insert(notice);

    task.confidence = 0.95;
    return notice;
  }

  private async executeScheduleMaintenance(task: AgentTask): Promise<any> {
    const { maintenance_type, property_id, priority, vendor_id } = task.context;
    
    const maintenance = {
      id: `maint_${Date.now()}`,
      type: maintenance_type,
      property_id,
      priority,
      vendor_id,
      scheduledDate: this.calculateOptimalMaintenanceDate(priority),
      status: 'scheduled'
    };

    // Store maintenance request
    await supabase
      .from('maintenance_requests')
      .insert(maintenance);

    task.confidence = 0.93;
    return maintenance;
  }

  private async executeCreateReport(task: AgentTask): Promise<any> {
    const { report_type, data_source, association_id } = task.context;
    
    const report = {
      id: `report_${Date.now()}`,
      type: report_type,
      associationId: association_id,
      data: this.generateReportData(report_type, data_source),
      createdAt: new Date().toISOString()
    };

    task.confidence = 0.89;
    return report;
  }

  private async executeUpdateRecords(task: AgentTask): Promise<any> {
    const { table_name, record_id, updates } = task.context;
    
    const { data, error } = await supabase
      .from(table_name)
      .update(updates)
      .eq('id', record_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update record: ${error.message}`);
    }

    task.confidence = 0.98;
    return data;
  }

  // Communication executors
  private async executeSendNotification(task: AgentTask): Promise<any> {
    const { recipient_id, message, channel } = task.context;
    
    const notification = {
      id: `notif_${Date.now()}`,
      user_id: recipient_id,
      title: message.title,
      message: message.content,
      type: message.type || 'info',
      channel: channel || 'app',
      created_at: new Date().toISOString()
    };

    await supabase
      .from('notifications')
      .insert(notification);

    task.confidence = 0.97;
    return notification;
  }

  private async executeEscalateIssue(task: AgentTask): Promise<any> {
    const { issue_id, escalation_level, reason } = task.context;
    
    const escalation = {
      issueId: issue_id,
      level: escalation_level,
      reason,
      escalatedAt: new Date().toISOString(),
      status: 'pending'
    };

    task.confidence = 0.94;
    return escalation;
  }

  private async executeResidentOutreach(task: AgentTask): Promise<any> {
    const { resident_id, outreach_type, template } = task.context;
    
    const outreach = {
      residentId: resident_id,
      type: outreach_type,
      template,
      scheduledDate: new Date().toISOString(),
      status: 'scheduled'
    };

    task.confidence = 0.92;
    return outreach;
  }

  // Helper methods
  private calculatePaymentTrend(payments: any[]): string {
    if (payments.length < 2) return 'insufficient_data';
    
    const recent = payments.slice(-3);
    const amounts = recent.map(p => Number(p.net_amount));
    const trend = amounts[amounts.length - 1] - amounts[0];
    
    return trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable';
  }

  private generateFinancialRecommendations(balance: number, payments: any[]): string[] {
    const recommendations = [];
    
    if (balance > 1000) {
      recommendations.push('Consider payment plan options');
      recommendations.push('Send payment reminder notice');
    }
    
    if (payments.length > 0 && this.calculatePaymentTrend(payments) === 'declining') {
      recommendations.push('Monitor payment behavior closely');
      recommendations.push('Consider early intervention');
    }
    
    return recommendations;
  }

  private calculateComplianceScore(issues: any[]): number {
    if (issues.length === 0) return 100;
    
    const weights = { critical: 10, high: 5, medium: 2, low: 1 };
    const totalWeight = issues.reduce((sum, issue) => sum + (weights[issue.severity as keyof typeof weights] || 1), 0);
    
    return Math.max(0, 100 - totalWeight);
  }

  private generateComplianceActions(issues: any[]): string[] {
    return issues.map(issue => `Address ${issue.severity} ${issue.type} issue`);
  }

  private calculateAverageResolutionTime(requests: any[]): number {
    const completed = requests.filter(r => r.status === 'completed');
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((sum, r) => {
      const created = new Date(r.created_at).getTime();
      const completed = new Date(r.updated_at).getTime();
      return sum + (completed - created);
    }, 0);
    
    return totalTime / completed.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private calculateMaintenanceScore(requests: any[]): number {
    const urgent = requests.filter(r => r.priority === 'urgent').length;
    const total = requests.length;
    
    if (total === 0) return 100;
    return Math.max(0, 100 - (urgent / total) * 50);
  }

  private predictMaintenanceIssues(requests: any[]): string[] {
    // Simplified prediction logic
    const commonIssues = requests.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(commonIssues)
      .filter(([_, count]) => count >= 2)
      .map(([category, _]) => `Potential recurring ${category} issues`);
  }

  private classifyDocumentType(name: string, fileType: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('invoice') || lowerName.includes('bill')) return 'invoice';
    if (lowerName.includes('contract') || lowerName.includes('agreement')) return 'contract';
    if (lowerName.includes('report')) return 'report';
    if (lowerName.includes('budget')) return 'budget';
    if (lowerName.includes('notice')) return 'notice';
    
    return 'general';
  }

  private extractDocumentData(document: any): Record<string, any> {
    // Simplified data extraction
    return {
      fileName: document.name,
      fileSize: document.file_size,
      uploadDate: document.created_at,
      category: document.category
    };
  }

  private suggestDocumentActions(document: any): string[] {
    const actions = ['Store in appropriate folder'];
    
    if (document.category === 'invoice') {
      actions.push('Process for payment');
      actions.push('Update accounting records');
    }
    
    return actions;
  }

  private calculateRecommendedBudget(analysis: any): number {
    if (!analysis) return 50000; // Default budget
    
    return analysis.totalAssessments * 1.1; // 10% buffer
  }

  private createBudgetBreakdown(analysis: any): Record<string, number> {
    return {
      maintenance: 30,
      utilities: 25,
      insurance: 20,
      management: 15,
      reserves: 10
    };
  }

  private identifyBudgetRisks(analysis: any): string[] {
    const risks = [];
    
    if (analysis?.riskLevel === 'high') {
      risks.push('High delinquency rate');
    }
    
    return risks;
  }

  private rankVendors(vendors: any[], budgetRange: [number, number]): any[] {
    return vendors
      .filter(v => {
        const avgCost = v.average_cost || 0;
        return avgCost >= budgetRange[0] && avgCost <= budgetRange[1];
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }

  private getVendorSelectionCriteria(): string[] {
    return ['Rating', 'Cost', 'Availability', 'Experience'];
  }

  private assessVendorRisks(vendors: any[]): string[] {
    return ['Insurance verification needed', 'License validation required'];
  }

  private assessViolationSeverity(violationData: any): 'low' | 'medium' | 'high' | 'critical' {
    // Simplified severity assessment
    if (violationData.safety_risk) return 'critical';
    if (violationData.legal_impact) return 'high';
    if (violationData.visible_impact) return 'medium';
    return 'low';
  }

  private recommendViolationAction(violationData: any): string {
    const severity = this.assessViolationSeverity(violationData);
    
    const actions = {
      critical: 'Immediate intervention required',
      high: 'Issue formal notice within 24 hours',
      medium: 'Send warning notice within 3 days',
      low: 'Include in next routine communication'
    };
    
    return actions[severity];
  }

  private defineEscalationPath(violationData: any): string[] {
    return [
      'Initial notice',
      'Follow-up warning',
      'Formal violation notice',
      'Board review',
      'Legal action if necessary'
    ];
  }

  private assessLegalRisk(violationData: any): 'low' | 'medium' | 'high' {
    return violationData.legal_impact ? 'high' : 'low';
  }

  private generateNoticeContent(noticeType: string, templateData: any): string {
    // Simplified notice generation
    return `Generated ${noticeType} notice with data: ${JSON.stringify(templateData)}`;
  }

  private calculateOptimalMaintenanceDate(priority: string): string {
    const daysFromNow = priority === 'urgent' ? 1 : priority === 'high' ? 3 : 7;
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  }

  private generateReportData(reportType: string, dataSource: any): any {
    return {
      type: reportType,
      generatedAt: new Date().toISOString(),
      dataPoints: Object.keys(dataSource || {}).length
    };
  }

  private async persistChain(chain: AgentChain): Promise<void> {
    try {
      await supabase
        .from('ai_agent_chains')
        .upsert({
          id: chain.id,
          name: chain.name,
          association_id: chain.associationId,
          tasks: chain.tasks,
          current_task_index: chain.currentTaskIndex,
          status: chain.status,
          metadata: chain.metadata
        });
    } catch (error) {
      devLog.error('Failed to persist agent chain:', error);
    }
  }

  // Public methods for monitoring and control
  async getActiveChains(): Promise<AgentChain[]> {
    return Array.from(this.activeChains.values());
  }

  async getChainStatus(chainId: string): Promise<AgentChain | null> {
    return this.activeChains.get(chainId) || null;
  }

  async pauseChain(chainId: string): Promise<void> {
    const chain = this.activeChains.get(chainId);
    if (chain) {
      chain.status = 'paused';
      await this.persistChain(chain);
    }
  }

  async resumeChain(chainId: string): Promise<void> {
    const chain = this.activeChains.get(chainId);
    if (chain && chain.status === 'paused') {
      chain.status = 'running';
      await this.persistChain(chain);
      this.executeChain(chainId);
    }
  }
}

export const advancedAgentEngine = new AdvancedAgentEngine();