
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useSupabaseCreate } from '@/hooks/supabase';

interface MeetingMinutesFormProps {
  associationId: string;
}

const MeetingMinutesForm: React.FC<MeetingMinutesFormProps> = ({ associationId }) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [title, setTitle] = React.useState('');
  const [attendees, setAttendees] = React.useState('');

  const { mutate: createMeetingMinutes } = useSupabaseCreate('meeting_minutes');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop all audio tracks
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Please enter a meeting title');
      return;
    }

    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('file', audioBlob, 'meeting-recording.wav');
      }

      // Create meeting minutes entry
      await createMeetingMinutes({
        association_id: associationId,
        title,
        attendees: attendees.split(',').map(a => a.trim()),
        status: 'processing'
      });

      toast.success('Meeting minutes created successfully');
      setTitle('');
      setAttendees('');
      setAudioBlob(null);
    } catch (error) {
      console.error('Error creating meeting minutes:', error);
      toast.error('Failed to create meeting minutes');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Record Meeting Minutes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Meeting Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4"
            />
            <Textarea
              placeholder="Attendees (comma-separated)"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="mb-4"
            />
          </div>

          <div className="flex gap-4">
            {!isRecording ? (
              <Button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            ) : (
              <Button
                type="button"
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <MicOff className="w-4 h-4" />
                Stop Recording
              </Button>
            )}
          </div>

          {audioBlob && (
            <div className="mt-4">
              <audio controls src={URL.createObjectURL(audioBlob)} />
            </div>
          )}

          <Button type="submit" className="w-full mt-4">
            Generate Minutes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeetingMinutesForm;
