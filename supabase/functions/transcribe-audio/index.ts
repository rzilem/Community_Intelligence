import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const openAiWhisperKey = Deno.env.get('OPENAI_WHISPER_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const form = await req.formData();
    const audio = form.get('audio');
    const title = form.get('title') as string | null;
    const associationId = form.get('association_id') as string | null;

    if (!(audio instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Audio file required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileName = `meeting-audio/${Date.now()}-${audio.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audio.stream(), { contentType: audio.type || 'audio/webm' });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName);
    const audioUrl = urlData.publicUrl;

    if (!openAiWhisperKey) {
      throw new Error('OPENAI_WHISPER_API_KEY not configured');
    }

    const formBody = new FormData();
    formBody.append('file', audio, audio.name);
    formBody.append('model', 'whisper-1');

    const transcriptionRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openAiWhisperKey}` },
      body: formBody,
    });

    if (!transcriptionRes.ok) {
      const errText = await transcriptionRes.text();
      throw new Error(`Transcription failed: ${errText}`);
    }

    const transcriptionData = await transcriptionRes.json();
    const transcriptText = transcriptionData.text as string;

    const { data: minutes, error: insertError } = await supabase
      .from('meeting_minutes')
      .insert({
        audio_url: audioUrl,
        transcript: transcriptText,
        title: title || 'Voice Note',
        meeting_date: new Date().toISOString().slice(0, 10),
        status: 'transcribed',
        association_id: associationId || null,
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    let summary: any = null;
    try {
      const { data, error } = await supabase.functions.invoke('openai-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: transcriptText,
          contentType: 'homeowner-request',
          metadata: {},
        }),
      });
      if (!error) {
        summary = data?.extractedData;
        await supabase
          .from('meeting_minutes')
          .update({ key_action_items: summary })
          .eq('id', minutes.id);
      }
    } catch (err) {
      console.warn('Post-processing failed:', err);
    }

    return new Response(
      JSON.stringify({ transcript: transcriptText, audioUrl, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    console.error('Transcription error:', err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

