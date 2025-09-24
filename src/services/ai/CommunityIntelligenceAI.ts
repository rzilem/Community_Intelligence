import { supabase } from '@/integrations/supabase/client';

export interface AIConversation {
  id: string;
  user_id: string;
  association_id?: string;
  title: string;
  messages: AIMessage[];
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AIInsight {
  id: string;
  type: 'predictive' | 'diagnostic' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence_score: number;
  data: Record<string, any>;
  association_id?: string;
  created_at: string;
}

export interface SmartSuggestion {
  id: string;
  type: 'action' | 'optimization' | 'automation' | 'communication';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_impact: string;
  implementation_effort: 'low' | 'medium' | 'high';
  suggested_actions: string[];
  association_id?: string;
  created_at: string;
}

export interface DocumentAnalysisResult {
  classification: string;
  confidence: number;
  extracted_data: Record<string, any>;
  suggested_actions: string[];
  key_insights: string[];
  compliance_notes?: string[];
}

export interface PredictiveAnalysisResult {
  predictions: Array<{
    metric: string;
    predicted_value: number;
    confidence: number;
    timeframe: string;
    factors: string[];
  }>;
  trends: Array<{
    category: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    time_period: string;
  }>;
  recommendations: string[];
}

class CommunityIntelligenceAI {
  private baseUrl = 'https://api.openai.com/v1';
  
  /**
   * Sends a chat message to OpenAI and returns the response
   */
  async sendChatMessage(
    message: string, 
    conversationHistory: AIMessage[] = [],
    associationId?: string,
    context?: Record<string, any>
  ): Promise<string> {
    try {
      // Build context-aware system prompt
      const systemPrompt = this.buildSystemPrompt(associationId, context);
      
      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const { data, error } = await supabase.functions.invoke('ai-query', {
        body: {
          messages,
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 1500
        }
      });

      if (error) {
        throw new Error(`AI Service Error: ${error.message}`);
      }

      return data.answer || 'I apologize, but I encountered an issue generating a response. Please try again.';
    } catch (error) {
      console.error('Error in sendChatMessage:', error);
      throw error;
    }
  }

  /**
   * Analyzes a document using AI and returns structured insights
   */
  async analyzeDocument(
    documentContent: string,
    documentType: string,
    associationId?: string
  ): Promise<DocumentAnalysisResult> {
    try {
      const prompt = `
Analyze this ${documentType} document for a homeowners association and provide structured insights:

Document Content:
${documentContent.substring(0, 4000)}

Please analyze and return a JSON response with:
1. Document classification (contract, financial_report, maintenance_request, compliance_document, etc.)
2. Confidence score (0-1)
3. Key extracted data (dates, amounts, parties involved, etc.)
4. Suggested actions for HOA management
5. Key insights and important information
6. Any compliance or legal notes

Format your response as valid JSON only.
      `;

      const { data, error } = await supabase.functions.invoke('openai-analyze', {
        body: { prompt }
      });

      if (error) {
        throw new Error(`Document analysis error: ${error.message}`);
      }

      try {
        const analysis = JSON.parse(data.analysis);
        return {
          classification: analysis.classification || 'unknown',
          confidence: analysis.confidence || 0.5,
          extracted_data: analysis.extracted_data || {},
          suggested_actions: analysis.suggested_actions || [],
          key_insights: analysis.key_insights || [],
          compliance_notes: analysis.compliance_notes || []
        };
      } catch (parseError) {
        console.error('Failed to parse AI analysis:', parseError);
        return {
          classification: 'unknown',
          confidence: 0.3,
          extracted_data: {},
          suggested_actions: ['Manual review required'],
          key_insights: ['Document uploaded successfully but requires manual analysis'],
          compliance_notes: []
        };
      }
    } catch (error) {
      console.error('Error in analyzeDocument:', error);
      throw error;
    }
  }

  /**
   * Generates predictive analytics for HOA operations
   */
  async generatePredictiveAnalytics(
    historicalData: Record<string, any>,
    associationId?: string
  ): Promise<PredictiveAnalysisResult> {
    try {
      const prompt = `
Analyze this HOA historical data and provide predictive insights:

Data: ${JSON.stringify(historicalData, null, 2)}

Provide predictions for:
1. Financial trends (budget, expenses, reserves)
2. Maintenance needs and costs
3. Compliance risks
4. Member satisfaction trends
5. Operational efficiency metrics

Return structured JSON with predictions, trends, and actionable recommendations.
      `;

      const { data, error } = await supabase.functions.invoke('openai-analyze', {
        body: { prompt }
      });

      if (error) {
        throw new Error(`Predictive analysis error: ${error.message}`);
      }

      try {
        const analysis = JSON.parse(data.analysis);
        return {
          predictions: analysis.predictions || [],
          trends: analysis.trends || [],
          recommendations: analysis.recommendations || []
        };
      } catch (parseError) {
        console.error('Failed to parse predictive analysis:', parseError);
        return {
          predictions: [],
          trends: [],
          recommendations: ['Insufficient data for predictive analysis']
        };
      }
    } catch (error) {
      console.error('Error in generatePredictiveAnalytics:', error);
      throw error;
    }
  }

  /**
   * Analyzes communication sentiment and suggests responses
   */
  async analyzeCommunication(
    message: string,
    messageType: 'email' | 'complaint' | 'request' | 'inquiry',
    context?: Record<string, any>
  ): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    suggested_response: string;
    action_items: string[];
    confidence: number;
  }> {
    try {
      const prompt = `
Analyze this HOA communication and provide structured insights:

Message Type: ${messageType}
Content: ${message}
Context: ${JSON.stringify(context || {}, null, 2)}

Analyze for:
1. Sentiment (positive/neutral/negative)
2. Urgency level (low/medium/high/urgent)
3. Category (maintenance, financial, complaint, etc.)
4. Suggested professional response
5. Action items for HOA staff
6. Confidence in analysis (0-1)

Return as valid JSON only.
      `;

      const { data, error } = await supabase.functions.invoke('openai-analyze', {
        body: { prompt }
      });

      if (error) {
        throw new Error(`Communication analysis error: ${error.message}`);
      }

      try {
        const analysis = JSON.parse(data.analysis);
        return {
          sentiment: analysis.sentiment || 'neutral',
          urgency: analysis.urgency || 'medium',
          category: analysis.category || 'general',
          suggested_response: analysis.suggested_response || '',
          action_items: analysis.action_items || [],
          confidence: analysis.confidence || 0.5
        };
      } catch (parseError) {
        console.error('Failed to parse communication analysis:', parseError);
        return {
          sentiment: 'neutral',
          urgency: 'medium',
          category: 'general',
          suggested_response: 'Thank you for your message. We have received your communication and will respond accordingly.',
          action_items: ['Review message manually', 'Assign to appropriate staff member'],
          confidence: 0.3
        };
      }
    } catch (error) {
      console.error('Error in analyzeCommunication:', error);
      throw error;
    }
  }

  /**
   * Generates smart suggestions for HOA operations
   */
  async generateSmartSuggestions(
    currentData: Record<string, any>,
    associationId?: string
  ): Promise<SmartSuggestion[]> {
    try {
      const prompt = `
Based on this HOA operational data, generate smart suggestions for improvements:

Data: ${JSON.stringify(currentData, null, 2)}

Generate 3-5 actionable suggestions covering:
1. Cost optimization opportunities
2. Process automation potential
3. Compliance improvements
4. Member communication enhancements
5. Maintenance optimization

Each suggestion should include:
- Type (action/optimization/automation/communication)
- Priority level
- Estimated impact
- Implementation effort
- Specific action steps

Return as JSON array.
      `;

      const { data, error } = await supabase.functions.invoke('openai-analyze', {
        body: { prompt }
      });

      if (error) {
        throw new Error(`Smart suggestions error: ${error.message}`);
      }

      try {
        const suggestions = JSON.parse(data.analysis);
        return Array.isArray(suggestions) ? suggestions.map((suggestion, index) => ({
          id: `suggestion-${Date.now()}-${index}`,
          type: suggestion.type || 'optimization',
          title: suggestion.title || 'Operational Improvement',
          description: suggestion.description || '',
          priority: suggestion.priority || 'medium',
          estimated_impact: suggestion.estimated_impact || 'Medium positive impact',
          implementation_effort: suggestion.implementation_effort || 'medium',
          suggested_actions: suggestion.suggested_actions || [],
          association_id: associationId,
          created_at: new Date().toISOString()
        })) : [];
      } catch (parseError) {
        console.error('Failed to parse smart suggestions:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error in generateSmartSuggestions:', error);
      return [];
    }
  }

  /**
   * Builds context-aware system prompt for AI interactions
   */
  private buildSystemPrompt(associationId?: string, context?: Record<string, any>): string {
    let prompt = `You are Community Intelligence, an AI assistant specialized in homeowners association (HOA) and condominium management. You have deep expertise in:

1. HOA Operations & Governance
2. Financial Management & Budgeting
3. Property Maintenance & Compliance
4. Community Relations & Communication
5. Legal & Regulatory Requirements
6. Technology Integration & Automation

Your responses should be:
- Professional and helpful
- Specific to HOA/condo management contexts
- Actionable with clear next steps
- Compliant with relevant regulations
- Focused on community value and efficiency

`;

    if (associationId) {
      prompt += `\nYou are currently assisting with Association ID: ${associationId}`;
    }

    if (context) {
      prompt += `\nRelevant context: ${JSON.stringify(context, null, 2)}`;
    }

    prompt += `\nAlways provide practical, implementable advice that helps improve HOA operations and community satisfaction.`;

    return prompt;
  }

  /**
   * Saves conversation to database
   */
  async saveConversation(conversation: Partial<AIConversation>): Promise<string> {
    try {
      // For now, return a mock ID since we haven't created the database table yet
      // This will be implemented in Phase 2
      const conversationId = `conv-${Date.now()}`;
      console.log('Conversation saved (mock):', conversationId, conversation);
      return conversationId;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  /**
   * Retrieves conversation history
   */
  async getConversationHistory(conversationId: string): Promise<AIMessage[]> {
    try {
      // Mock implementation for now
      console.log('Retrieving conversation history (mock):', conversationId);
      return [];
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }
}

export const communityIntelligenceAI = new CommunityIntelligenceAI();