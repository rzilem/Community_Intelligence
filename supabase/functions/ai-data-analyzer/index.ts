
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      columns, 
      sampleData = [], 
      dataType, 
      associationId,
      systemFields = [] 
    } = await req.json();

    console.log('AI Data Analyzer - Processing:', {
      columnsCount: columns?.length,
      sampleRowsCount: sampleData?.length,
      dataType,
      systemFieldsCount: systemFields?.length
    });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare context for OpenAI
    const contextPrompt = `
You are an intelligent data mapping assistant for a HOA management system. 
Analyze the uploaded data and provide intelligent field mapping suggestions.

Data Type: ${dataType}
File Columns: ${JSON.stringify(columns)}
Sample Data (first 3 rows): ${JSON.stringify(sampleData.slice(0, 3))}
Available System Fields: ${JSON.stringify(systemFields.map(f => ({ value: f.value, label: f.label })))}

Your task:
1. Analyze each column's content and semantics
2. Map file columns to the most appropriate system fields
3. Identify data quality issues
4. Suggest data transformations if needed
5. Provide confidence scores (0-1) for each mapping

Please respond with a JSON object in this exact format:
{
  "mappings": {
    "file_column_name": {
      "systemField": "system_field_name",
      "confidence": 0.95,
      "reasoning": "Why this mapping makes sense",
      "dataQuality": "good|warning|error",
      "suggestions": ["any transformation suggestions"]
    }
  },
  "overallAnalysis": {
    "dataQuality": "excellent|good|fair|poor",
    "issues": ["list of identified issues"],
    "recommendations": ["list of recommendations"]
  }
}

Focus on semantic understanding - don't just match string patterns. Consider:
- Data context and meaning
- HOA management domain knowledge
- Data format consistency
- Completeness and quality
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert data analyst specializing in HOA management systems. Provide intelligent, context-aware data mapping suggestions.'
          },
          {
            role: 'user',
            content: contextPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    console.log('AI Analysis completed successfully:', {
      mappingsCount: Object.keys(aiAnalysis.mappings || {}).length,
      overallQuality: aiAnalysis.overallAnalysis?.dataQuality
    });

    return new Response(JSON.stringify({
      success: true,
      analysis: aiAnalysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI data analyzer:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
