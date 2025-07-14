import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { fileContent, fileName, fileType, associationId, userDescription } = await req.json();

    console.log('AI Import Processor started:', { fileName, fileType, associationId });

    // Step 1: Analyze file content with AI
    console.log('Step 1: Analyzing file content with AI...');
    const analysisPrompt = `
      You are an AI data analyst for a property management system. Analyze this data and provide a comprehensive import plan.

      File: ${fileName} (${fileType})
      User Description: ${userDescription || 'No description provided'}
      
      Data Preview (first 500 characters):
      ${typeof fileContent === 'string' ? fileContent.substring(0, 500) : JSON.stringify(fileContent).substring(0, 500)}

      Identify:
      1. Data type (properties, residents, financial, maintenance, compliance, etc.)
      2. Table structure and field mappings
      3. Data quality issues
      4. Required transformations
      5. Confidence level (0-100%)
      6. Missing required fields
      7. Suggested default values
      8. Data relationships

      Return a JSON response with this structure:
      {
        "dataType": "properties|residents|financial|maintenance|compliance|mixed",
        "confidence": 95,
        "targetTables": ["properties", "residents"],
        "fieldMappings": {
          "Address": "address",
          "Owner Name": "owner_name",
          "Unit #": "unit_number"
        },
        "dataQuality": {
          "issues": ["Missing phone numbers in 3 rows"],
          "warnings": ["Inconsistent date formats"],
          "suggestions": ["Standardize phone format"]
        },
        "transformations": [
          {
            "field": "phone",
            "action": "format",
            "description": "Standardize phone numbers"
          }
        ],
        "requiredFields": ["address", "association_id"],
        "missingFields": [],
        "suggestedDefaults": {
          "property_type": "residential",
          "status": "active"
        },
        "relationships": [
          {
            "type": "property_to_resident",
            "description": "Link residents to properties via address"
          }
        ],
        "summary": "High-quality property data with minor formatting issues"
      }
    `;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert data analyst for property management systems. Always respond with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
      }),
    });

    const aiData = await aiResponse.json();
    let analysisResult;
    
    try {
      analysisResult = JSON.parse(aiData.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      analysisResult = {
        dataType: 'unknown',
        confidence: 50,
        targetTables: [],
        fieldMappings: {},
        dataQuality: { issues: ['Unable to analyze data structure'], warnings: [], suggestions: [] },
        transformations: [],
        requiredFields: [],
        missingFields: [],
        suggestedDefaults: {},
        relationships: [],
        summary: 'AI analysis failed, manual review required'
      };
    }

    console.log('AI Analysis Result:', analysisResult);

    // Step 2: Validate against database schema
    console.log('Step 2: Validating against database schema...');
    const { data: associations } = await supabase
      .from('associations')
      .select('id, name, property_type')
      .eq('id', associationId)
      .single();

    if (!associations) {
      throw new Error('Association not found');
    }

    // Step 3: Generate import preview
    console.log('Step 3: Generating import preview...');
    const importPreview = {
      analysisResult,
      association: associations,
      estimatedRecords: Array.isArray(fileContent) ? fileContent.length : 
                        typeof fileContent === 'string' ? fileContent.split('\n').length - 1 : 0,
      readyToImport: analysisResult.confidence > 70 && analysisResult.missingFields.length === 0,
      humanReviewRequired: analysisResult.confidence < 90 || analysisResult.dataQuality.issues.length > 0,
      processingTime: new Date().toISOString()
    };

    console.log('Import preview generated successfully');

    return new Response(JSON.stringify({
      success: true,
      ...importPreview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI import processor:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error occurred',
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});