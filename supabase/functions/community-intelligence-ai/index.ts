
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, associationId, userId } = await req.json();
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Server configuration error");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch relevant data for context enhancement
    const contextData = await getContextData(supabase, associationId, userId);
    
    // Fetch OpenAI API key from system settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'integrations')
      .single();

    if (settingsError) {
      throw new Error(`Failed to retrieve OpenAI API key: ${settingsError.message}`);
    }

    const integrationSettings = settingsData?.value?.integrationSettings || {};
    const openAIConfig = integrationSettings.OpenAI || {};
    const apiKey = openAIConfig.apiKey;
    const model = openAIConfig.model || 'gpt-4o-mini';

    if (!apiKey) {
      throw new Error("No OpenAI API key configured");
    }

    // Build the system prompt with context about the HOA management application
    const systemPrompt = `
You are Community Intelligence AI, an assistant for the HOA management application.
The current date is ${new Date().toISOString().split('T')[0]}.

You have access to the following information:
- Association: ${contextData.association ? JSON.stringify(contextData.association) : 'No specific association context'}
- Recent activity: ${contextData.recentActivity ? `${contextData.recentActivity.length} recent items` : 'No recent activity'}
- User role: ${contextData.userRole || 'Unknown'}

Respond in a helpful, professional manner. For financial questions, provide accurate information based on the available data.
If asked to perform actions like sending notifications or creating records, explain how the user can do this through the application.
`;

    // Make request to OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || openaiResponse.status}`);
    }

    const result = await openaiResponse.json();
    const aiResponse = result.choices[0].message.content;

    // Log this interaction for future reference
    await logAiInteraction(supabase, userId, query, aiResponse, associationId);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        model: model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in community-intelligence-ai function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getContextData(supabase, associationId, userId) {
  const contextData = {
    association: null,
    recentActivity: [],
    userRole: null
  };

  try {
    // Get association data if available
    if (associationId) {
      const { data: association } = await supabase
        .from('associations')
        .select('*')
        .eq('id', associationId)
        .single();
      
      contextData.association = association;
    }

    // Get user role
    if (userId && associationId) {
      const { data: userRole } = await supabase
        .from('association_users')
        .select('role')
        .eq('user_id', userId)
        .eq('association_id', associationId)
        .single();
      
      contextData.userRole = userRole?.role;
    }

    // Get recent activity (limited to 10 items)
    const { data: recentActivity } = await supabase
      .from('activity_log')
      .select('*')
      .eq(associationId ? 'association_id' : 'id', associationId || 'not-null')
      .order('created_at', { ascending: false })
      .limit(10);
    
    contextData.recentActivity = recentActivity || [];

  } catch (error) {
    console.error("Error fetching context data:", error);
  }

  return contextData;
}

async function logAiInteraction(supabase, userId, query, response, associationId = null) {
  try {
    await supabase
      .from('ai_interactions')
      .insert({
        user_id: userId,
        query,
        response,
        association_id: associationId,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error logging AI interaction:", error);
  }
}
