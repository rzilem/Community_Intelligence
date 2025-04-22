
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if we have the required environment variables
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key is not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { title, formType, description } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Form title is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare the prompt for OpenAI
    let formTypeText = "";
    switch (formType) {
      case 'portal_request':
        formTypeText = "a general portal request form for homeowners to submit various requests to the HOA";
        break;
      case 'arc_application':
        formTypeText = "an Architectural Review Committee application form for homeowners to request approval for property modifications";
        break;
      case 'pool_form':
        formTypeText = "a pool reservation/booking form for residents to reserve time at the community pool";
        break;
      case 'gate_request':
        formTypeText = "a gate access request form for residents to request access cards or register guests";
        break;
      default:
        formTypeText = "a general purpose form";
    }

    const prompt = `
You are a helpful assistant specializing in creating form field structures for a Homeowners Association (HOA) management system.

Based on the following information:
- Form Title: "${title}"
- Form Type: ${formTypeText}
${description ? `- Description: "${description}"` : ''}

Generate appropriate form fields for this form. 

Return the result as a JSON array of field objects with the following structure:
{
  "id": "generate-a-unique-id",
  "type": "one-of: text, textarea, email, phone, number, date, time, select, checkbox, radio, file",
  "label": "Human-readable field label",
  "placeholder": "Optional placeholder text",
  "required": true or false,
  "options": [{"label": "Option 1", "value": "option1"}] (only for select, checkbox, or radio)
}

Include appropriate fields relevant to the form title and type. Ensure the fields make logical sense for an HOA management context.
`;

    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates form field structures for an HOA management system.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling OpenAI API');
    }

    // Parse the response to get the field suggestions
    const content = data.choices[0].message.content;
    let fields = [];

    try {
      // Try to extract JSON from the response (sometimes it's wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        fields = JSON.parse(jsonMatch[1]);
      } else {
        // If no code blocks, try parsing the whole response
        fields = JSON.parse(content);
      }
      
      // Ensure each field has the required properties
      fields = fields.map(field => ({
        id: field.id || `field-${Math.random().toString(36).substr(2, 9)}`,
        type: field.type || 'text',
        label: field.label || 'Untitled Field',
        placeholder: field.placeholder || '',
        required: field.required === undefined ? false : field.required,
        options: field.options || [],
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', content);
      
      // Return a fallback with some basic fields
      fields = [
        {
          id: `field-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          label: 'Name',
          placeholder: 'Enter your name',
          required: true
        },
        {
          id: `field-${Math.random().toString(36).substr(2, 9)}`,
          type: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          required: true
        },
        {
          id: `field-${Math.random().toString(36).substr(2, 9)}`,
          type: 'textarea',
          label: 'Details',
          placeholder: 'Provide additional details...',
          required: false
        }
      ];
    }

    return new Response(
      JSON.stringify({ fields }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in suggest-form-fields function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
