
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSupabaseQuery } from '@/hooks/supabase';
import { format } from 'date-fns';

interface MeetingsListProps {
  associationId: string;
}

const MeetingsList: React.FC<MeetingsListProps> = ({ associationId }) => {
  const { data: meetings = [], isLoading } = useSupabaseQuery(
    'meeting_minutes',
    {
      select: '*',
      filter: [{ column: 'association_id', value: associationId }],
      order: { column: 'created_at', ascending: false }
    }
  );

  if (isLoading) {
    return <div>Loading meetings...</div>;
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting: any) => (
        <Card key={meeting.id}>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">{meeting.title}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(meeting.meeting_date), 'PPP')}
            </p>
            {meeting.minutes_content && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium mb-2">Minutes:</h4>
                <p>{meeting.minutes_content}</p>
              </div>
            )}
            {meeting.key_action_items?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Action Items:</h4>
                <ul className="list-disc pl-5">
                  {meeting.key_action_items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MeetingsList;
