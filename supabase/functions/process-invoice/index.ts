import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { imageUrl, associationId } = await req.json();
    if (!imageUrl || !associationId) {
      return new Response(
        JSON.stringify({ error: 'Missing parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extract = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: [ { type: 'text', text: 'Extract all text from this invoice.' }, { type: 'image_url', image_url: { url: imageUrl } } ] }
        ],
        max_tokens: 2000
      })
    });
    const extractData = await extract.json();
    const rawText = extractData.choices?.[0]?.message?.content ?? '';

    const parse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Parse this invoice text and return JSON with vendor_name, invoice_number, invoice_date, due_date, total_amount, line_items.' },
          { role: 'user', content: rawText }
        ],
        response_format: { type: 'json_object' }
      })
    });
    const parseData = await parse.json();
    const structured = JSON.parse(parseData.choices?.[0]?.message?.content ?? '{}');

    await supabase.from('ai_processing_results').insert({
      association_id: associationId,
      raw_text_extracted: rawText,
      structured_data: structured
    });

    return new Response(
      JSON.stringify(structured),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
