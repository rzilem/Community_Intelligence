
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

    // Enhanced context prompt with better instructions
    const contextPrompt = `
You are an expert data mapping assistant for a HOA (Homeowners Association) management system. 
Your task is to analyze uploaded data and provide intelligent field mapping suggestions.

CONTEXT:
- Data Type: ${dataType}
- File Columns (${columns?.length}): ${JSON.stringify(columns)}
- Sample Data (first 3 rows): ${JSON.stringify(sampleData.slice(0, 3))}
- Available System Fields: ${JSON.stringify(systemFields.map(f => ({ value: f.value, label: f.label })))}

INSTRUCTIONS:
1. Analyze each column's content semantically, not just by name
2. Consider HOA management context (properties, residents, assessments, maintenance, etc.)
3. Map file columns to the most appropriate system fields
4. Identify data quality issues (missing values, format problems, inconsistencies)
5. Suggest data transformations if needed
6. Provide confidence scores (0-1) based on content analysis
7. Give clear reasoning for each mapping decision

RESPONSE FORMAT (JSON only):
{
  "mappings": {
    "file_column_name": {
      "systemField": "system_field_name",
      "confidence": 0.95,
      "reasoning": "Detailed explanation of why this mapping makes sense based on data content",
      "dataQuality": "good|warning|error",
      "suggestions": ["specific improvement suggestions for this column"]
    }
  },
  "overallAnalysis": {
    "dataQuality": "excellent|good|fair|poor",
    "issues": ["specific data quality issues found"],
    "recommendations": ["actionable recommendations for data improvement"]
  }
}

IMPORTANT RULES: 
- Focus on semantic understanding of the data content, not just column names
- Consider HOA domain knowledge (properties have addresses, residents have names, etc.)
- High confidence (0.8+) only for very clear matches
- Be specific about data quality issues
- Provide actionable suggestions
- Return only valid JSON without any markdown formatting
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
            content: 'You are an expert data analyst specializing in HOA management systems. Respond only with valid JSON matching the specified format. No markdown, no explanations outside the JSON.'
          },
          {
            role: 'user',
            content: contextPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response content from OpenAI');
    }

    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      console.error('Parse error:', parseError);
      throw new Error('Invalid AI response format - could not parse JSON');
    }

    // Validate the response structure
    if (!aiAnalysis.mappings || !aiAnalysis.overallAnalysis) {
      console.error('Invalid AI response structure:', aiAnalysis);
      throw new Error('AI response missing required fields');
    }

    console.log('AI Analysis completed successfully:', {
      mappingsCount: Object.keys(aiAnalysis.mappings || {}).length,
      overallQuality: aiAnalysis.overallAnalysis?.dataQuality,
      issuesFound: aiAnalysis.overallAnalysis?.issues?.length || 0
    });

    return new Response(JSON.stringify({
      success: true,
      analysis: aiAnalysis,
      metadata: {
        columnsAnalyzed: columns?.length || 0,
        sampleRowsUsed: sampleData?.length || 0,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI data analyzer:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Check the function logs for more information',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
