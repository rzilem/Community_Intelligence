
import { supabase } from '@/integrations/supabase/client';
import { CommunicationIntelligence } from '@/types/ai-workflow-types';
import { devLog } from '@/utils/dev-logger';

// Helper function to convert database row to CommunicationIntelligence
function convertToCommunicationIntelligence(row: any): CommunicationIntelligence {
  return {
    id: row.id,
    communication_id: row.communication_id,
    association_id: row.association_id,
    message_content: row.message_content,
    ai_category: row.ai_category,
    sentiment_score: row.sentiment_score,
    urgency_level: row.urgency_level as 'low' | 'normal' | 'high' | 'urgent',
    suggested_responses: typeof row.suggested_responses === 'string'
      ? JSON.parse(row.suggested_responses)
      : row.suggested_responses || [],
    auto_routing_rules: typeof row.auto_routing_rules === 'string'
      ? JSON.parse(row.auto_routing_rules)
      : row.auto_routing_rules || {},
    confidence_metrics: typeof row.confidence_metrics === 'string'
      ? JSON.parse(row.confidence_metrics)
      : row.confidence_metrics || {},
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export class CommunicationIntelligenceHub {
  async analyzeMessage(
    messageContent: string,
    associationId: string,
    communicationId?: string
  ): Promise<CommunicationIntelligence> {
    try {
      devLog.info('Analyzing message with AI', { associationId, communicationId });

      // Simulate AI analysis - replace with actual AI service call
      const analysis = await this.performAIAnalysis(messageContent);

      const intelligenceData = {
        communication_id: communicationId,
        association_id: associationId,
        message_content: messageContent,
        ai_category: analysis.category,
        sentiment_score: analysis.sentiment,
        urgency_level: analysis.urgency as 'low' | 'normal' | 'high' | 'urgent',
        suggested_responses: analysis.suggestedResponses,
        auto_routing_rules: analysis.routingRules,
        confidence_metrics: analysis.confidence
      };

      const { data, error } = await supabase
        .from('communication_intelligence')
        .insert(intelligenceData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save communication intelligence: ${error.message}`);
      }

      return convertToCommunicationIntelligence(data);
    } catch (error) {
      devLog.error('Failed to analyze message', error);
      throw error;
    }
  }

  private async performAIAnalysis(messageContent: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-extractor', {
        body: {
          content: messageContent,
          contentType: 'message-analysis'
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'AI extraction failed');
      }

      const extracted = data.extractedData || {};

      return {
        category: extracted.category || 'general',
        urgency: extracted.urgency || 'normal',
        sentiment: typeof extracted.sentiment === 'number' ? extracted.sentiment : 0,
        suggestedResponses: extracted.suggested_responses || [],
        routingRules: extracted.routing_rules || {},
        confidence: data.confidence || {}
      };
    } catch (err) {
      devLog.error('AI extraction failed', err);
      return {
        category: 'general',
        urgency: 'normal',
        sentiment: 0,
        suggestedResponses: [],
        routingRules: {},
        confidence: {}
      };
    }
  }

  private generateSuggestedResponses(category: string, urgency: string): string[] {
    const responses: Record<string, string[]> = {
      emergency: [
        "Thank you for reaching out. We're treating this as urgent and will respond within 1 hour.",
        "We've received your emergency request and are dispatching help immediately."
      ],
      complaint: [
        "We apologize for any inconvenience. Let us investigate this matter and get back to you.",
        "Thank you for bringing this to our attention. We take all concerns seriously."
      ],
      maintenance: [
        "We've received your maintenance request. A work order has been created.",
        "Thank you for reporting this. We'll schedule an inspection within 2 business days."
      ],
      billing: [
        "Thank you for your payment inquiry. Let us review your account and respond shortly.",
        "We've received your billing question and will have accounting review it."
      ],
      general: [
        "Thank you for contacting us. We'll review your message and respond appropriately.",
        "We appreciate you reaching out and will get back to you soon."
      ]
    };

    return responses[category] || responses.general;
  }

  private generateRoutingRules(category: string, urgency: string): Record<string, any> {
    const rules: Record<string, any> = {
      emergency: {
        assignTo: 'emergency_team',
        priority: 'urgent',
        escalate: true,
        notifyManagement: true
      },
      complaint: {
        assignTo: 'customer_service',
        priority: 'high',
        escalate: false,
        requireManagerReview: true
      },
      maintenance: {
        assignTo: 'maintenance_team',
        priority: urgency === 'urgent' ? 'high' : 'normal',
        createWorkOrder: true
      },
      billing: {
        assignTo: 'accounting_team',
        priority: 'normal',
        requireAccountReview: true
      },
      general: {
        assignTo: 'general_inbox',
        priority: 'normal'
      }
    };

    return rules[category] || rules.general;
  }

  async getCommunicationIntelligence(communicationId: string): Promise<CommunicationIntelligence | null> {
    const { data, error } = await supabase
      .from('communication_intelligence')
      .select('*')
      .eq('communication_id', communicationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No record found
      }
      throw new Error(`Failed to get communication intelligence: ${error.message}`);
    }

    return convertToCommunicationIntelligence(data);
  }

  async getIntelligenceByAssociation(
    associationId: string,
    filters?: {
      category?: string;
      urgencyLevel?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<CommunicationIntelligence[]> {
    let query = supabase
      .from('communication_intelligence')
      .select('*')
      .eq('association_id', associationId);

    if (filters?.category) {
      query = query.eq('ai_category', filters.category);
    }

    if (filters?.urgencyLevel) {
      query = query.eq('urgency_level', filters.urgencyLevel);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get communication intelligence: ${error.message}`);
    }

    return data ? data.map(convertToCommunicationIntelligence) : [];
  }

  async getAnalytics(associationId: string): Promise<any> {
    const intelligence = await this.getIntelligenceByAssociation(associationId);

    const analytics = {
      totalMessages: intelligence.length,
      categoryBreakdown: this.calculateCategoryBreakdown(intelligence),
      urgencyDistribution: this.calculateUrgencyDistribution(intelligence),
      sentimentAnalysis: this.calculateSentimentAnalysis(intelligence),
      averageConfidence: this.calculateAverageConfidence(intelligence),
      trendsOverTime: this.calculateTrends(intelligence)
    };

    return analytics;
  }

  private calculateCategoryBreakdown(intelligence: CommunicationIntelligence[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    intelligence.forEach(item => {
      const category = item.ai_category || 'uncategorized';
      breakdown[category] = (breakdown[category] || 0) + 1;
    });
    return breakdown;
  }

  private calculateUrgencyDistribution(intelligence: CommunicationIntelligence[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    intelligence.forEach(item => {
      distribution[item.urgency_level] = (distribution[item.urgency_level] || 0) + 1;
    });
    return distribution;
  }

  private calculateSentimentAnalysis(intelligence: CommunicationIntelligence[]): any {
    if (intelligence.length === 0) return { average: 0, positive: 0, neutral: 0, negative: 0 };

    const sentiments = intelligence.map(item => item.sentiment_score);
    const average = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
    
    const positive = sentiments.filter(score => score > 0.1).length;
    const negative = sentiments.filter(score => score < -0.1).length;
    const neutral = intelligence.length - positive - negative;

    return { average, positive, neutral, negative };
  }

  private calculateAverageConfidence(intelligence: CommunicationIntelligence[]): number {
    if (intelligence.length === 0) return 0;

    const confidenceScores = intelligence
      .map(item => item.confidence_metrics?.overall || 0)
      .filter(score => score > 0);

    return confidenceScores.length > 0
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
      : 0;
  }

  private calculateTrends(intelligence: CommunicationIntelligence[]): any {
    // Group by day and calculate trends
    const dailyData: Record<string, any> = {};
    
    intelligence.forEach(item => {
      const date = item.created_at.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, sentiment: 0, urgent: 0 };
      }
      dailyData[date].count++;
      dailyData[date].sentiment += item.sentiment_score;
      if (item.urgency_level === 'urgent') {
        dailyData[date].urgent++;
      }
    });

    // Convert to array format for charting
    const trends = Object.entries(dailyData).map(([date, data]: [string, any]) => ({
      date,
      messageCount: data.count,
      averageSentiment: data.sentiment / data.count,
      urgentCount: data.urgent
    }));

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  }

  async updateIntelligence(
    id: string,
    updates: Partial<CommunicationIntelligence>
  ): Promise<CommunicationIntelligence> {
    const { data, error } = await supabase
      .from('communication_intelligence')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update communication intelligence: ${error.message}`);
    }

    return convertToCommunicationIntelligence(data);
  }

  async deleteIntelligence(id: string): Promise<void> {
    const { error } = await supabase
      .from('communication_intelligence')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete communication intelligence: ${error.message}`);
    }
  }
}

export const communicationIntelligenceHub = new CommunicationIntelligenceHub();
