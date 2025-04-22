
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User, Shield, AlertTriangle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  action: string;
  details: any;
  performed_by: string;
  created_at: string;
}

interface RequestTimelineProps {
  events: TimelineEvent[];
}

const RequestTimeline: React.FC<RequestTimelineProps> = ({ events }) => {
  const getIcon = (action: string) => {
    switch (action) {
      case 'status_change':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'comment':
        return <User className="h-5 w-5 text-green-500" />;
      case 'update':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-6 border-l-2 border-gray-200"></div>
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative pl-12">
                <div className="absolute left-[18px] top-1.5 transform -translate-x-1/2 rounded-full">
                  {getIcon(event.action)}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {event.performed_by}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm">
                    {event.action === 'status_change' ? (
                      <p>
                        Status changed from{' '}
                        <span className="font-medium">{event.details.old.status}</span> to{' '}
                        <span className="font-medium">{event.details.new.status}</span>
                      </p>
                    ) : (
                      <p>{JSON.stringify(event.details.changes)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestTimeline;
