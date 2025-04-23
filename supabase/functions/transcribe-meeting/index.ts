
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

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
    const { meetingId, audioUrl } = await req.json();

    // 1. Download the audio file
    const audioResponse = await fetch(audioUrl);
    const audioData = await audioResponse.blob();

    // 2. Transcribe using OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', audioData, 'audio.wav');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    const transcription = await transcriptionResponse.json();

    // 3. Generate minutes using GPT-4
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional meeting minutes generator. Create concise, well-organized minutes from the meeting transcript. Include key points, decisions, and action items.',
          },
          {
            role: 'user',
            content: `Please generate meeting minutes from this transcript:\n\n${transcription.text}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const gptResult = await gptResponse.json();
    const minutes = gptResult.choices[0].message.content;

    // 4. Update the meeting minutes in the database
    const { error: updateError } = await supabase
      .from('meeting_minutes')
      .update({
        transcript: transcription.text,
        minutes_content: minutes,
        status: 'completed',
      })
      .eq('id', meetingId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, minutes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in transcribe-meeting function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
