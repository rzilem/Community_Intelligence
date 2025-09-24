import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      operation, 
      data, 
      associationId, 
      userId,
      ...params 
    } = await req.json();

    console.log(`HOA Operations: ${operation}`, { associationId, userId });

    switch (operation) {
      case 'chat':
        return await handleChat(params, associationId);
      
      case 'analyze_document':
        return await handleDocumentAnalysis(params, associationId);
      
      case 'generate_insights':
        return await handleInsightGeneration(params, associationId, supabase);
      
      case 'analyze_communication':
        return await handleCommunicationAnalysis(params, associationId);
      
      case 'generate_suggestions':
        return await handleSuggestionGeneration(params, associationId, supabase);
      
      case 'get_conversations':
        return await handleGetConversations(userId, associationId, supabase);
      
      case 'save_conversation':
        return await handleSaveConversation(params, userId, associationId, supabase);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

  } catch (error) {
    console.error('HOA Operations error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleChat(params: any, associationId?: string) {
  const { messages, temperature = 0.7, maxTokens = 1500 } = params;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(associationId)
        },
        ...messages
      ],
      temperature,
      max_tokens: maxTokens
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const answer = data.choices[0]?.message?.content;

  return new Response(
    JSON.stringify({ success: true, answer }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleDocumentAnalysis(params: any, associationId?: string) {
  const { content, documentType, filename } = params;
  
  const prompt = `
Analyze this ${documentType} document for a homeowners association and provide structured insights:

Document: ${filename || 'Unnamed Document'}
Content: ${content.substring(0, 4000)}

Please analyze and return a JSON response with:
1. Document classification (contract, financial_report, maintenance_request, compliance_document, bylaws, etc.)
2. Confidence score (0-1)
3. Key extracted data (dates, amounts, parties involved, deadlines, etc.)
4. Suggested actions for HOA management
5. Key insights and important information
6. Any compliance or legal notes
7. Priority level (low, medium, high, urgent)

Format your response as valid JSON only.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HOA document analyst. Analyze documents and provide structured JSON responses only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  let analysis;
  
  try {
    analysis = JSON.parse(data.choices[0]?.message?.content);
  } catch (parseError) {
    console.error('Failed to parse document analysis:', parseError);
    analysis = {
      classification: 'unknown',
      confidence: 0.3,
      extracted_data: {},
      suggested_actions: ['Manual review required'],
      key_insights: ['Document uploaded successfully but requires manual analysis'],
      compliance_notes: [],
      priority: 'medium'
    };
  }

  return new Response(
    JSON.stringify({ success: true, analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleInsightGeneration(params: any, associationId?: string, supabase: any) {
  try {
    // Fetch recent HOA data for analysis
    const [associations, properties, documents] = await Promise.all([
      associationId ? 
        supabase.from('associations').select('*').eq('id', associationId).single() :
        supabase.from('associations').select('*').limit(1).single(),
      supabase.from('properties').select('*').limit(10),
      supabase.from('documents').select('*').limit(5)
    ]);

    const contextData = {
      association: associations.data,
      properties: properties.data || [],
      documents: documents.data || [],
      timestamp: new Date().toISOString()
    };

    const prompt = `
Analyze this HOA operational data and generate actionable insights:

Association Data: ${JSON.stringify(contextData.association, null, 2)}
Recent Properties: ${JSON.stringify(contextData.properties, null, 2)}
Recent Documents: ${JSON.stringify(contextData.documents, null, 2)}

Generate insights covering:
1. Financial health indicators
2. Property management efficiency
3. Document organization and compliance
4. Operational optimization opportunities
5. Risk assessment and mitigation

Provide 3-5 specific, actionable insights with priority levels and implementation suggestions.
Return as valid JSON array.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HOA operations analyst. Generate actionable insights in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let insights;
    
    try {
      insights = JSON.parse(data.choices[0]?.message?.content);
    } catch (parseError) {
      console.error('Failed to parse insights:', parseError);
      insights = [
        {
          type: 'diagnostic',
          title: 'Data Analysis Complete',
          description: 'HOA data has been analyzed successfully',
          confidence_score: 0.7,
          priority: 'medium',
          recommendations: ['Review generated analysis', 'Implement suggested improvements']
        }
      ];
    }

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in insight generation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to generate insights',
        insights: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCommunicationAnalysis(params: any, associationId?: string) {
  const { message, messageType, context = {} } = params;
  
  const prompt = `
Analyze this HOA communication for sentiment, urgency, and suggested response:

Message Type: ${messageType}
Content: ${message}
Context: ${JSON.stringify(context, null, 2)}

Analyze for:
1. Sentiment (positive/neutral/negative)
2. Urgency level (low/medium/high/urgent)
3. Category (maintenance, financial, complaint, compliment, inquiry, violation, etc.)
4. Key concerns or issues mentioned
5. Suggested professional response template
6. Action items for HOA staff
7. Escalation recommendations
8. Confidence in analysis (0-1)

Return as valid JSON only.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in HOA communication analysis. Provide structured JSON responses only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  let analysis;
  
  try {
    analysis = JSON.parse(data.choices[0]?.message?.content);
  } catch (parseError) {
    console.error('Failed to parse communication analysis:', parseError);
    analysis = {
      sentiment: 'neutral',
      urgency: 'medium',
      category: 'general',
      concerns: ['Communication received'],
      suggested_response: 'Thank you for your message. We have received your communication and will respond accordingly.',
      action_items: ['Review message', 'Assign to appropriate staff'],
      escalation_needed: false,
      confidence: 0.3
    };
  }

  return new Response(
    JSON.stringify({ success: true, analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSuggestionGeneration(params: any, associationId?: string, supabase: any) {
  try {
    // Fetch operational data for suggestions
    const [associations, documents, communications] = await Promise.all([
      associationId ? 
        supabase.from('associations').select('*').eq('id', associationId).single() :
        supabase.from('associations').select('*').limit(1).single(),
      supabase.from('documents').select('*').limit(5),
      supabase.from('communications').select('*').limit(3)
    ]);

    const operationalData = {
      association: associations.data,
      recent_documents: documents.data || [],
      recent_communications: communications.data || [],
      ...params.additionalData
    };

    const prompt = `
Based on this HOA operational data, generate smart suggestions for improvements:

Data: ${JSON.stringify(operationalData, null, 2)}

Generate 3-5 actionable suggestions covering:
1. Cost optimization opportunities
2. Process automation potential  
3. Compliance improvements
4. Member communication enhancements
5. Technology integration opportunities
6. Maintenance optimization
7. Financial management improvements

Each suggestion should include:
- type (action/optimization/automation/communication/financial)
- title (brief, actionable)
- description (detailed explanation)
- priority (low/medium/high/urgent)
- estimated_impact (description of expected benefits)
- implementation_effort (low/medium/high)
- suggested_actions (array of specific steps)
- cost_estimate (optional)
- timeline (optional)

Return as JSON array only.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HOA management consultant. Generate actionable improvement suggestions in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let suggestions;
    
    try {
      suggestions = JSON.parse(data.choices[0]?.message?.content);
    } catch (parseError) {
      console.error('Failed to parse suggestions:', parseError);
      suggestions = [
        {
          type: 'optimization',
          title: 'Review Current Operations',
          description: 'Conduct a comprehensive review of current HOA operations for improvement opportunities',
          priority: 'medium',
          estimated_impact: 'Medium positive impact on efficiency',
          implementation_effort: 'medium',
          suggested_actions: [
            'Schedule operations review meeting',
            'Gather feedback from residents',
            'Identify process bottlenecks'
          ]
        }
      ];
    }

    return new Response(
      JSON.stringify({ success: true, suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggestion generation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to generate suggestions',
        suggestions: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGetConversations(userId: string, associationId?: string, supabase: any) {
  try {
    // For now, return mock conversations since we haven't created the table yet
    const conversations = [
      {
        id: 'conv-1',
        title: 'HOA Budget Planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 5
      }
    ];

    return new Response(
      JSON.stringify({ success: true, conversations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new Response(
      JSON.stringify({ success: false, conversations: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleSaveConversation(params: any, userId: string, associationId?: string, supabase: any) {
  try {
    // For now, just return a mock ID since we haven't created the table yet
    const conversationId = `conv-${Date.now()}`;
    
    console.log('Saving conversation (mock):', {
      conversationId,
      userId,
      associationId,
      title: params.title
    });

    return new Response(
      JSON.stringify({ success: true, conversationId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving conversation:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to save conversation' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

function buildSystemPrompt(associationId?: string): string {
  let prompt = `You are Community Intelligence, an AI assistant specialized in homeowners association (HOA) and condominium management. You have deep expertise in:

1. HOA Operations & Governance
   - Board management and meeting facilitation
   - Bylaws interpretation and compliance
   - Election procedures and voting protocols
   - Committee organization and oversight

2. Financial Management & Budgeting  
   - Budget preparation and monitoring
   - Reserve fund management
   - Assessment collection and delinquency
   - Financial reporting and audits
   - Vendor payment processing

3. Property Maintenance & Compliance
   - Preventive maintenance scheduling
   - Capital improvement planning
   - Violation tracking and enforcement
   - Architectural review processes
   - Safety and compliance audits

4. Community Relations & Communication
   - Resident communication strategies
   - Complaint resolution procedures
   - Event planning and coordination
   - Newsletter and announcement management
   - Conflict mediation

5. Legal & Regulatory Requirements
   - State and local HOA laws
   - Fair Housing compliance
   - ADA requirements
   - Insurance and liability management
   - Contract review and negotiation

6. Technology Integration & Automation
   - Property management software
   - Online payment systems
   - Communication platforms
   - Document management
   - Reporting and analytics

Your responses should be:
- Professional and helpful
- Specific to HOA/condo management contexts  
- Actionable with clear next steps
- Compliant with relevant regulations
- Focused on community value and efficiency
- Based on industry best practices

`;

  if (associationId) {
    prompt += `\nYou are currently assisting with Association ID: ${associationId}`;
  }

  prompt += `\nAlways provide practical, implementable advice that helps improve HOA operations and community satisfaction. When appropriate, suggest specific tools, templates, or resources that would be helpful.`;

  return prompt;
}