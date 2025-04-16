
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailIcon, PhoneIcon, MessageSquareIcon, PlusIcon, CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { Lead } from '@/types/lead-types';

// Define interface for communication entries
interface Communication {
  id: number;
  type: 'email' | 'call' | 'message' | 'meeting';
  subject: string;
  content: string;
  date: string;
  from: string;
  to: string;
}

interface LeadCommunicationTabProps {
  lead?: Lead;
}

const LeadCommunicationTab: React.FC<LeadCommunicationTabProps> = ({ lead }) => {
  // This is a placeholder component that would be connected to real data
  const communications: Communication[] = [
    { 
      id: 1, 
      type: 'email',
      subject: 'Follow-up on your inquiry',
      content: 'Thank you for your interest in our HOA management services...',
      date: '2025-04-15T14:30:00Z',
      from: 'john.doe@company.com',
      to: 'lead@example.com'
    },
    { 
      id: 2, 
      type: 'call',
      subject: 'Initial consultation call',
      content: 'Discussed the client\'s needs and provided an overview of our services...',
      date: '2025-04-16T10:15:00Z',
      from: 'John Doe',
      to: 'Lead Contact'
    },
    { 
      id: 3, 
      type: 'meeting',
      subject: 'Virtual meeting to discuss proposal',
      content: 'Scheduled a Zoom meeting to go through the proposal details and answer any questions...',
      date: '2025-04-17T15:00:00Z',
      from: 'John Doe',
      to: 'Lead Board Members'
    }
  ];

  const getCommunicationIcon = (type: Communication['type']) => {
    switch (type) {
      case 'email':
        return <MailIcon className="h-5 w-5 text-blue-500" />;
      case 'call':
        return <PhoneIcon className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageSquareIcon className="h-5 w-5 text-purple-500" />;
      case 'meeting':
        return <CalendarIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <MessageSquareIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Render action buttons for adding new communications
  const renderActionButtons = () => (
    <div className="flex gap-2">
      <Button variant="outline" className="flex items-center gap-2">
        <MailIcon className="h-4 w-4" />
        Send Email
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <PhoneIcon className="h-4 w-4" />
        Log Call
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4" />
        Schedule Meeting
      </Button>
    </div>
  );

  // Render a communication item
  const renderCommunicationItem = (comm: Communication) => (
    <div key={comm.id} className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-muted/30 p-3 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full">
            {getCommunicationIcon(comm.type)}
          </div>
          <div>
            <h4 className="font-medium">{comm.subject}</h4>
            <p className="text-sm text-muted-foreground">
              {formatDate(comm.date)}
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {comm.type === 'email' ? (
            <span>From: {comm.from} To: {comm.to}</span>
          ) : (
            <span>Between {comm.from} and {comm.to}</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm">{comm.content}</p>
      </div>
    </div>
  );

  // Render empty state for when there are no communications
  const renderEmptyState = () => (
    <div className="text-center py-10 border rounded-md bg-muted/10">
      <MessageSquareIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground">No communication history available for this lead.</p>
      <div className="flex gap-2 justify-center mt-4">
        <Button variant="outline" className="flex items-center gap-2">
          <MailIcon className="h-4 w-4" />
          Send First Email
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <PhoneIcon className="h-4 w-4" />
          Log First Call
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Communication History</h3>
          {renderActionButtons()}
        </div>
        
        {communications.length > 0 ? (
          <div className="space-y-4">
            {communications.map(renderCommunicationItem)}
          </div>
        ) : (
          renderEmptyState()
        )}
      </CardContent>
    </Card>
  );
};

export default LeadCommunicationTab;
