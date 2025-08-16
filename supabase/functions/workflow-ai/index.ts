
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, workflowName, workflowType, description, existingSteps } = await req.json();

    let prompt = '';
    
    if (action === 'generate') {
      prompt = `You are an expert HOA/Condo management consultant. Generate a detailed workflow with 4-7 steps for:

Workflow: ${workflowName}
Type: ${workflowType}
Description: ${description || 'No additional description provided'}

Return ONLY a JSON object with this structure:
{
  "steps": [
    {
      "id": "unique_step_id",
      "name": "Step Name",
      "description": "What happens in this step",
      "order": 1,
      "notifyRoles": ["role1", "role2"],
      "autoExecute": false
    }
  ]
}

Available roles: admin, manager, accountant, treasurer, board, maintenance, resident
Make steps practical, actionable, and appropriate for the workflow type.`;

    } else if (action === 'optimize') {
      prompt = `You are an expert HOA/Condo management consultant. Optimize these existing workflow steps:

Current Steps: ${JSON.stringify(existingSteps, null, 2)}

Improve by:
- Adding missing critical steps
- Optimizing step order
- Improving descriptions
- Setting appropriate auto-execution flags
- Ensuring proper role notifications

Return ONLY a JSON object with:
{
  "steps": [...optimized steps array...],
  "improvements": ["improvement 1", "improvement 2", ...]
}`;
    }

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
            content: 'You are a workflow automation expert specializing in HOA/Condo management. Always respond with valid JSON only.'
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
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ 
      success: true, 
      result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Workflow AI error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
