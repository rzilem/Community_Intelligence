
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { documentUrl, documentName, documentType, associationId } = await req.json();
    
    if (!documentUrl) {
      throw new Error('Document URL is required');
    }
    
    console.log(`Processing document: ${documentName} (${documentType})`);
    
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status}`);
    }
    
    let documentContent = await response.text();
    
    // Trim content if too large
    const maxContentLength = 15000;
    if (documentContent.length > maxContentLength) {
      documentContent = documentContent.substring(0, maxContentLength) + "... [Content truncated]";
    }
    
    // Call OpenAI with enhanced system prompt for action suggestions
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an AI assistant specialized in analyzing HOA documents and suggesting actionable items. 
            Extract key information, identify required actions, and suggest automated processes. Format your response 
            as JSON with the following structure:
            {
              "summary": "Brief summary of the document",
              "docType": "Document type identification",
              "keyTopics": ["List of key topics covered"],
              "suggestedActions": [
                {
                  "type": "action type (e.g., create_request, send_message, schedule_meeting)",
                  "priority": "high|medium|low",
                  "description": "Description of the suggested action",
                  "context": "Why this action is suggested",
                  "automated": boolean
                }
              ],
              "importantDates": [
                {
                  "date": "YYYY-MM-DD",
                  "description": "What's happening on this date"
                }
              ],
              "requiredApprovals": ["List of roles/departments needed for approval"],
              "complianceItems": ["List of compliance-related items identified"],
              "notificationTargets": ["List of roles/groups that should be notified"]
            }`
          },
          {
            role: 'user',
            content: `Analyze this HOA document and suggest actions: ${documentContent}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }
    
    const analysisData = await openAIResponse.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);
    
    console.log('Analysis completed successfully');
    
    // Store analysis results
    const { data: storedAnalysis, error: storageError } = await supabase
      .from('document_analyses')
      .insert({
        document_url: documentUrl,
        document_name: documentName,
        document_type: documentType,
        analysis_results: analysis,
        association_id: associationId
      })
      .select()
      .single();
    
    if (storageError) {
      throw storageError;
    }

    // Process suggested actions
    for (const action of analysis.suggestedActions || []) {
      if (action.automated) {
        try {
          await processAutomatedAction(supabase, action, analysis, documentName, associationId);
        } catch (error) {
          console.error('Error processing automated action:', error);
        }
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      analysis: {
        ...analysis,
        associationId
      },
      analysisId: storedAnalysis.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processAutomatedAction(supabase: any, action: any, analysis: any, documentName: string, associationId: string) {
  switch (action.type) {
    case 'create_request':
      await supabase.from('homeowner_requests').insert({
        title: `Auto-created from document: ${documentName}`,
        description: action.description,
        type: 'general',
        priority: action.priority,
        status: 'open',
        association_id: associationId
      });
      break;

    case 'send_message':
      await supabase.from('scheduled_messages').insert({
        subject: `Action Required: ${action.description}`,
        content: `Based on document analysis of ${documentName}: ${action.context}`,
        type: 'email',
        recipient_groups: analysis.notificationTargets,
        category: 'general',
        association_id: associationId
      });
      break;

    case 'schedule_meeting':
      const meetingDate = analysis.importantDates?.[0]?.date;
      if (meetingDate) {
        await supabase.from('calendar_events').insert({
          title: action.description,
          description: action.context,
          start_time: meetingDate,
          end_time: new Date(new Date(meetingDate).getTime() + 60 * 60 * 1000).toISOString(),
          event_type: 'meeting',
          hoa_id: associationId
        });
      }
      break;
  }
}
