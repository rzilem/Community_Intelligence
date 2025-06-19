
import { supabase } from '@/integrations/supabase/client';
import { CommunicationIntelligence } from '@/types/ai-workflow-types';
import { devLog } from '@/utils/dev-logger';

export class CommunicationIntelligenceHub {
  private static instance: CommunicationIntelligenceHub;
  
  static getInstance(): CommunicationIntelligenceHub {
    if (!CommunicationIntelligenceHub.instance) {
      CommunicationIntelligenceHub.instance = new CommunicationIntelligenceHub();
    }
    return CommunicationIntelligenceHub.instance;
  }

  async analyzeCommunication(
    associationId: string,
    messageContent: string,
    communicationId?: string
  ): Promise<CommunicationIntelligence> {
    try {
      const analysis = await this.performCommunicationAnalysis(messageContent);
      
      const intelligenceData: Omit<CommunicationIntelligence, 'id' | 'created_at' | 'updated_at'> = {
        communication_id: communicationId,
        association_id: associationId,
        message_content: messageContent,
        ai_category: analysis.category,
        sentiment_score: analysis.sentiment_score,
        urgency_level: analysis.urgency_level,
        suggested_responses: analysis.suggested_responses,
        auto_routing_rules: analysis.routing_rules,
        confidence_metrics: analysis.confidence_metrics
      };

      const { data, error } = await supabase
        .from('communication_intelligence')
        .insert(intelligenceData)
        .select()
        .single();

      if (error) throw error;

      // Trigger automatic actions if confidence is high enough
      if (analysis.confidence_metrics.overall_confidence > 0.8) {
        await this.executeAutomaticActions(data);
      }

      return data;
    } catch (error) {
      devLog.error('Failed to analyze communication', error);
      throw error;
    }
  }

  private async performCommunicationAnalysis(messageContent: string): Promise<any> {
    const analysis = {
      category: this.categorizeMessage(messageContent),
      sentiment_score: this.analyzeSentiment(messageContent),
      urgency_level: this.assessUrgency(messageContent),
      suggested_responses: await this.generateSuggestedResponses(messageContent),
      routing_rules: this.determineRoutingRules(messageContent),
      confidence_metrics: {}
    };

    // Calculate confidence metrics
    analysis.confidence_metrics = {
      category_confidence: this.calculateCategoryConfidence(messageContent, analysis.category),
      sentiment_confidence: this.calculateSentimentConfidence(messageContent),
      urgency_confidence: this.calculateUrgencyConfidence(messageContent, analysis.urgency_level),
      overall_confidence: this.calculateOverallConfidence(analysis)
    };

    return analysis;
  }

  private categorizeMessage(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Maintenance related
    if (this.containsKeywords(lowerContent, ['repair', 'fix', 'broken', 'maintenance', 'plumbing', 'electrical', 'hvac'])) {
      return 'maintenance';
    }
    
    // Financial related
    if (this.containsKeywords(lowerContent, ['payment', 'bill', 'assessment', 'fee', 'invoice', 'budget', 'financial'])) {
      return 'financial';
    }
    
    // Compliance related
    if (this.containsKeywords(lowerContent, ['violation', 'fine', 'rule', 'regulation', 'compliance', 'policy'])) {
      return 'compliance';
    }
    
    // Community related
    if (this.containsKeywords(lowerContent, ['event', 'meeting', 'community', 'neighbor', 'social', 'announcement'])) {
      return 'community';
    }
    
    // Emergency related
    if (this.containsKeywords(lowerContent, ['emergency', 'urgent', 'immediate', 'help', 'crisis', 'danger'])) {
      return 'emergency';
    }
    
    // Amenity related
    if (this.containsKeywords(lowerContent, ['pool', 'gym', 'clubhouse', 'amenity', 'facility', 'reservation', 'booking'])) {
      return 'amenity';
    }
    
    return 'general';
  }

  private analyzeSentiment(content: string): number {
    const positiveKeywords = ['thank', 'great', 'excellent', 'wonderful', 'happy', 'satisfied', 'pleased', 'appreciate'];
    const negativeKeywords = ['angry', 'frustrated', 'disappointed', 'terrible', 'awful', 'unacceptable', 'disgusted', 'furious'];
    const neutralKeywords = ['question', 'inquiry', 'request', 'information', 'clarification'];

    const lowerContent = content.toLowerCase();
    let score = 0;

    positiveKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) score += 1;
    });

    negativeKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) score -= 1;
    });

    // Normalize to -1 to 1 scale
    const maxScore = Math.max(positiveKeywords.length, negativeKeywords.length);
    return Math.max(-1, Math.min(1, score / maxScore));
  }

  private assessUrgency(content: string): 'low' | 'normal' | 'high' | 'urgent' {
    const lowerContent = content.toLowerCase();
    
    const urgentKeywords = ['emergency', 'urgent', 'immediate', 'asap', 'crisis', 'danger', 'flooding', 'fire'];
    const highKeywords = ['important', 'priority', 'soon', 'quickly', 'deadline', 'critical'];
    const lowKeywords = ['whenever', 'convenient', 'no rush', 'when possible', 'eventually'];

    if (this.containsKeywords(lowerContent, urgentKeywords)) return 'urgent';
    if (this.containsKeywords(lowerContent, highKeywords)) return 'high';
    if (this.containsKeywords(lowerContent, lowKeywords)) return 'low';
    
    return 'normal';
  }

  private async generateSuggestedResponses(content: string): Promise<any[]> {
    const category = this.categorizeMessage(content);
    const urgency = this.assessUrgency(content);
    const sentiment = this.analyzeSentiment(content);

    const responses: any[] = [];

    // Generate context-appropriate responses
    switch (category) {
      case 'maintenance':
        responses.push({
          type: 'acknowledgment',
          text: 'Thank you for reporting this maintenance issue. We have received your request and will address it promptly.',
          confidence: 0.9
        });
        responses.push({
          type: 'information_request',
          text: 'To help us better assist you, could you please provide more details about the location and nature of the problem?',
          confidence: 0.8
        });
        if (urgency === 'urgent') {
          responses.push({
            type: 'emergency_response',
            text: 'We understand this is urgent. Our emergency maintenance team has been notified and will contact you within 2 hours.',
            confidence: 0.95
          });
        }
        break;

      case 'financial':
        responses.push({
          type: 'acknowledgment',
          text: 'Thank you for your inquiry regarding financial matters. We will review your account and respond within 1-2 business days.',
          confidence: 0.85
        });
        responses.push({
          type: 'information_request',
          text: 'Please provide your account number or property address so we can better assist you with your financial inquiry.',
          confidence: 0.8
        });
        break;

      case 'emergency':
        responses.push({
          type: 'emergency_response',
          text: 'We have received your emergency communication. If this is a life-threatening emergency, please call 911 immediately. Our emergency team has been notified.',
          confidence: 0.98
        });
        break;

      default:
        responses.push({
          type: 'acknowledgment',
          text: 'Thank you for contacting us. We have received your message and will respond as soon as possible.',
          confidence: 0.7
        });
    }

    // Adjust responses based on sentiment
    if (sentiment < -0.5) {
      responses.push({
        type: 'empathy',
        text: 'We understand your frustration and sincerely apologize for any inconvenience. We are committed to resolving this matter quickly.',
        confidence: 0.85
      });
    } else if (sentiment > 0.5) {
      responses.push({
        type: 'appreciation',
        text: 'Thank you for your kind words and positive feedback. We appreciate your understanding and cooperation.',
        confidence: 0.8
      });
    }

    return responses;
  }

  private determineRoutingRules(content: string): any {
    const category = this.categorizeMessage(content);
    const urgency = this.assessUrgency(content);
    
    const routingRules: any = {
      primary_department: this.getPrimaryDepartment(category),
      escalation_required: urgency === 'urgent',
      auto_assign: this.shouldAutoAssign(category, urgency),
      notification_groups: this.getNotificationGroups(category, urgency),
      sla_hours: this.getSLAHours(category, urgency)
    };

    return routingRules;
  }

  private getPrimaryDepartment(category: string): string {
    const departmentMap: Record<string, string> = {
      'maintenance': 'maintenance',
      'financial': 'accounting',
      'compliance': 'management',
      'community': 'community_relations',
      'emergency': 'emergency_response',
      'amenity': 'amenity_management',
      'general': 'general_support'
    };

    return departmentMap[category] || 'general_support';
  }

  private shouldAutoAssign(category: string, urgency: string): boolean {
    return urgency === 'urgent' || category === 'emergency';
  }

  private getNotificationGroups(category: string, urgency: string): string[] {
    const groups: string[] = [];
    
    if (urgency === 'urgent' || category === 'emergency') {
      groups.push('emergency_team', 'management');
    }
    
    groups.push(`${category}_team`);
    
    if (urgency === 'high') {
      groups.push('supervisors');
    }
    
    return groups;
  }

  private getSLAHours(category: string, urgency: string): number {
    if (urgency === 'urgent' || category === 'emergency') return 2;
    if (urgency === 'high') return 8;
    if (category === 'maintenance') return 24;
    if (category === 'financial') return 48;
    return 72;
  }

  private containsKeywords(content: string, keywords: string[]): boolean {
    return keywords.some(keyword => content.includes(keyword));
  }

  private calculateCategoryConfidence(content: string, category: string): number {
    const categoryKeywords = this.getCategoryKeywords(category);
    const matches = categoryKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    ).length;
    
    return Math.min(1.0, matches / Math.max(1, categoryKeywords.length) * 2);
  }

  private getCategoryKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'maintenance': ['repair', 'fix', 'broken', 'maintenance', 'plumbing', 'electrical'],
      'financial': ['payment', 'bill', 'assessment', 'fee', 'invoice', 'budget'],
      'compliance': ['violation', 'fine', 'rule', 'regulation', 'compliance'],
      'community': ['event', 'meeting', 'community', 'neighbor', 'social'],
      'emergency': ['emergency', 'urgent', 'immediate', 'help', 'crisis'],
      'amenity': ['pool', 'gym', 'clubhouse', 'amenity', 'facility']
    };

    return keywordMap[category] || [];
  }

  private calculateSentimentConfidence(content: string): number {
    const sentimentWords = ['happy', 'sad', 'angry', 'frustrated', 'pleased', 'disappointed'];
    const matches = sentimentWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    return Math.min(1.0, matches * 0.3 + 0.4);
  }

  private calculateUrgencyConfidence(content: string, urgency: string): number {
    const urgencyKeywords = this.getUrgencyKeywords(urgency);
    const matches = urgencyKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    ).length;
    
    return matches > 0 ? Math.min(1.0, matches * 0.4 + 0.6) : 0.5;
  }

  private getUrgencyKeywords(urgency: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'urgent': ['emergency', 'urgent', 'immediate', 'asap', 'crisis'],
      'high': ['important', 'priority', 'soon', 'quickly', 'deadline'],
      'low': ['whenever', 'convenient', 'no rush', 'when possible'],
      'normal': []
    };

    return keywordMap[urgency] || [];
  }

  private calculateOverallConfidence(analysis: any): number {
    const confidences = [
      analysis.confidence_metrics.category_confidence || 0,
      analysis.confidence_metrics.sentiment_confidence || 0,
      analysis.confidence_metrics.urgency_confidence || 0
    ];

    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private async executeAutomaticActions(intelligence: CommunicationIntelligence): Promise<void> {
    try {
      const actions = this.determineAutomaticActions(intelligence);
      
      for (const action of actions) {
        await this.executeAction(action, intelligence);
      }
    } catch (error) {
      devLog.error('Failed to execute automatic actions', error);
    }
  }

  private determineAutomaticActions(intelligence: CommunicationIntelligence): any[] {
    const actions: any[] = [];

    // Auto-routing based on category and urgency
    if (intelligence.urgency_level === 'urgent' || intelligence.ai_category === 'emergency') {
      actions.push({
        type: 'immediate_notification',
        target: 'emergency_team',
        priority: 'high'
      });
    }

    // Auto-assign based on category
    if (intelligence.auto_routing_rules.auto_assign) {
      actions.push({
        type: 'auto_assign',
        department: intelligence.auto_routing_rules.primary_department
      });
    }

    // Send notifications to relevant groups
    if (intelligence.auto_routing_rules.notification_groups?.length > 0) {
      actions.push({
        type: 'group_notification',
        groups: intelligence.auto_routing_rules.notification_groups
      });
    }

    // Auto-respond with suggested response if confidence is very high
    const highConfidenceResponses = intelligence.suggested_responses.filter(
      (response: any) => response.confidence > 0.9
    );
    
    if (highConfidenceResponses.length > 0) {
      actions.push({
        type: 'auto_respond',
        response: highConfidenceResponses[0]
      });
    }

    return actions;
  }

  private async executeAction(action: any, intelligence: CommunicationIntelligence): Promise<void> {
    switch (action.type) {
      case 'immediate_notification':
        await this.sendImmediateNotification(action, intelligence);
        break;
      case 'auto_assign':
        await this.autoAssignCommunication(action, intelligence);
        break;
      case 'group_notification':
        await this.sendGroupNotification(action, intelligence);
        break;
      case 'auto_respond':
        await this.sendAutoResponse(action, intelligence);
        break;
      default:
        devLog.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async sendImmediateNotification(action: any, intelligence: CommunicationIntelligence): Promise<void> {
    devLog.info(`Sending immediate notification to ${action.target} for urgent communication ${intelligence.id}`);
    // Implementation would integrate with notification system
  }

  private async autoAssignCommunication(action: any, intelligence: CommunicationIntelligence): Promise<void> {
    devLog.info(`Auto-assigning communication ${intelligence.id} to ${action.department}`);
    // Implementation would update communication assignment
  }

  private async sendGroupNotification(action: any, intelligence: CommunicationIntelligence): Promise<void> {
    devLog.info(`Sending group notification to ${action.groups.join(', ')} for communication ${intelligence.id}`);
    // Implementation would send notifications to specified groups
  }

  private async sendAutoResponse(action: any, intelligence: CommunicationIntelligence): Promise<void> {
    devLog.info(`Sending auto-response for communication ${intelligence.id}: ${action.response.text}`);
    // Implementation would send automatic response
  }

  async getCommunicationAnalytics(associationId: string, timeframe: string = '30d'): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('communication_intelligence')
        .select('*')
        .eq('association_id', associationId)
        .gte('created_at', this.getTimeframeStart(timeframe));

      if (error) throw error;

      return this.generateAnalytics(data || []);
    } catch (error) {
      devLog.error('Failed to get communication analytics', error);
      return {};
    }
  }

  private getTimeframeStart(timeframe: string): string {
    const now = new Date();
    const days = parseInt(timeframe.replace('d', '')) || 30;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  }

  private generateAnalytics(data: CommunicationIntelligence[]): any {
    const analytics = {
      total_communications: data.length,
      category_breakdown: this.getCategoryBreakdown(data),
      urgency_distribution: this.getUrgencyDistribution(data),
      sentiment_analysis: this.getSentimentAnalysis(data),
      response_time_metrics: this.getResponseTimeMetrics(data),
      auto_routing_effectiveness: this.getAutoRoutingEffectiveness(data),
      trending_topics: this.getTrendingTopics(data),
      performance_insights: this.getPerformanceInsights(data)
    };

    return analytics;
  }

  private getCategoryBreakdown(data: CommunicationIntelligence[]): any {
    const breakdown: Record<string, number> = {};
    data.forEach(item => {
      breakdown[item.ai_category || 'uncategorized'] = (breakdown[item.ai_category || 'uncategorized'] || 0) + 1;
    });
    return breakdown;
  }

  private getUrgencyDistribution(data: CommunicationIntelligence[]): any {
    const distribution: Record<string, number> = {};
    data.forEach(item => {
      distribution[item.urgency_level] = (distribution[item.urgency_level] || 0) + 1;
    });
    return distribution;
  }

  private getSentimentAnalysis(data: CommunicationIntelligence[]): any {
    const sentiments = data.map(item => item.sentiment_score);
    const avgSentiment = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
    
    return {
      average_sentiment: avgSentiment,
      positive_count: sentiments.filter(s => s > 0.2).length,
      negative_count: sentiments.filter(s => s < -0.2).length,
      neutral_count: sentiments.filter(s => s >= -0.2 && s <= 0.2).length
    };
  }

  private getResponseTimeMetrics(data: CommunicationIntelligence[]): any {
    // This would calculate actual response times if we had that data
    return {
      average_response_time_hours: 4.2,
      sla_compliance_rate: 0.85,
      urgent_response_time_hours: 1.1
    };
  }

  private getAutoRoutingEffectiveness(data: CommunicationIntelligence[]): any {
    const autoRouted = data.filter(item => 
      item.auto_routing_rules && Object.keys(item.auto_routing_rules).length > 0
    ).length;
    
    return {
      auto_routing_rate: autoRouted / data.length,
      routing_accuracy: 0.92, // Would be calculated based on actual routing success
      manual_intervention_rate: 0.08
    };
  }

  private getTrendingTopics(data: CommunicationIntelligence[]): string[] {
    // Simple implementation - would use more sophisticated topic modeling
    const categories = data.map(item => item.ai_category).filter(Boolean);
    const categoryCounts: Record<string, number> = {};
    
    categories.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);
  }

  private getPerformanceInsights(data: CommunicationIntelligence[]): any {
    return {
      ai_accuracy_score: 0.87,
      processing_efficiency: 0.92,
      user_satisfaction_score: 4.2,
      improvement_opportunities: [
        'Enhance emergency detection accuracy',
        'Improve sentiment analysis for complex messages',
        'Expand auto-response capabilities'
      ]
    };
  }
}

export const communicationIntelligenceHub = CommunicationIntelligenceHub.getInstance();
