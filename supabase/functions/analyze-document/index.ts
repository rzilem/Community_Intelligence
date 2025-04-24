
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

// Required for the edge function to handle file data
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    // Get environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { documentUrl, documentName, documentType } = await req.json();
    
    if (!documentUrl) {
      throw new Error('Document URL is required');
    }
    
    console.log(`Processing document: ${documentName} (${documentType})`);
    console.log(`Document URL: ${documentUrl}`);
    
    // Fetch the document content
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }
    
    // Get document content as text
    let documentContent = '';
    
    // For text-based files, get the content directly
    if (documentType === 'pdf' || documentType === 'txt' || documentType === 'docx') {
      documentContent = await response.text();
    } else {
      throw new Error(`Unsupported document type: ${documentType}`);
    }
    
    // Prepare document content for analysis (trim if too large)
    const maxContentLength = 15000; // OpenAI token limits
    const trimmedContent = documentContent.length > maxContentLength 
      ? documentContent.substring(0, maxContentLength) + "... [Content truncated due to length]"
      : documentContent;
    
    console.log(`Document content length: ${documentContent.length} characters`);
    console.log(`Trimmed content length: ${trimmedContent.length} characters`);
    
    // Analyze document with OpenAI
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
            content: `You are an AI assistant specialized in analyzing HOA documents. Extract key information, 
            summarize content, and highlight important clauses and rules. Format your response as JSON with the 
            following structure:
            {
              "summary": "Brief summary of the document",
              "docType": "Document type identification",
              "keyTopics": ["List of key topics covered"],
              "importantClauses": [{"title": "Clause title", "summary": "Brief explanation"}],
              "actionItems": ["List of any action items or requirements"],
              "effectiveDates": ["Any dates mentioned that seem important"],
              "relevantRoles": ["Roles or departments this might be relevant to"]
            }
            `
          },
          {
            role: 'user',
            content: `Analyze this HOA document: ${trimmedContent}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`);
    }
    
    const analysisData = await openAIResponse.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);
    
    console.log('Analysis completed successfully');
    
    // Store analysis in database
    const { data: storedAnalysis, error: storageError } = await supabase
      .from('document_analyses')
      .insert({
        document_url: documentUrl,
        document_name: documentName,
        analysis_results: analysis,
        document_type: documentType
      })
      .select()
      .single();
    
    if (storageError) {
      console.error('Error storing analysis:', storageError);
      throw new Error(`Error storing analysis: ${storageError.message}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      analysis,
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
