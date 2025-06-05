import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_WHISPER_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file required' });
    }

    const buffer = fs.readFileSync(audioFile.filepath);
    const fileName = `meeting-audio/${Date.now()}-${
      audioFile.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'audio.webm'
    }`;

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, buffer, {
        contentType: audioFile.mimetype || 'audio/webm',
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName);
    const audioUrl = urlData.publicUrl;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.filepath),
      model: 'whisper-1',
    });

    const transcriptText = transcription.text;

    const { data: minutes, error: insertError } = await supabase
      .from('meeting_minutes')
      .insert({
        audio_url: audioUrl,
        transcript: transcriptText,
        title: (fields.title as string) || 'Voice Note',
        meeting_date: new Date().toISOString().slice(0, 10),
        status: 'transcribed',
        association_id: fields.association_id ? String(fields.association_id) : null,
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

    fs.unlinkSync(audioFile.filepath);

    res.status(200).json({ transcript: transcriptText, audioUrl, summary });
  } catch (err: any) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: err.message || 'Transcription failed' });
  }
}
