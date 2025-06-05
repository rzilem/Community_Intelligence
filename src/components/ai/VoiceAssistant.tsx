import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Mic, Square, Sparkles } from 'lucide-react';

const VoiceAssistant: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunks.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.current.push(e.data);
      }
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      await uploadRecording(blob);
      chunks.current = [];
    };
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  const uploadRecording = async (blob: Blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transcription failed');
      }
      setTranscript(data.transcript || '');
      if (data.summary) {
        setAiResponse(typeof data.summary === 'string' ? data.summary : JSON.stringify(data.summary, null, 2));
      }
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles size={16} className="text-hoa-blue" />
        <span className="ai-gradient-text">Voice Assistant</span>
      </div>
      <div className="flex items-center gap-2">
        {!recording ? (
          <Button onClick={startRecording} disabled={loading}>
            <Mic className="mr-2 h-4 w-4" /> Record
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive">
            <Square className="mr-2 h-4 w-4" /> Stop
          </Button>
        )}
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      {transcript && (
        <div className="text-sm whitespace-pre-wrap border-t pt-4">
          <p className="font-medium mb-1">Transcript:</p>
          {transcript}
        </div>
      )}
      {aiResponse && (
        <div className="text-sm whitespace-pre-wrap border-t pt-4">
          <p className="font-medium mb-1">AI Response:</p>
          {aiResponse}
        </div>
      )}
    </Card>
  );
};

export default VoiceAssistant;
