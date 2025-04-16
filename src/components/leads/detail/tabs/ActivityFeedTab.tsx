
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MailIcon, PhoneIcon, CalendarIcon, MessageSquareIcon, CheckCircleIcon, UserIcon, XCircleIcon } from 'lucide-react';
import { Lead } from '@/types/lead-types';

// Import components
import NotesSection from './activity/NotesSection';
import CommunicationsList from './activity/CommunicationsList';
import HistoryList from './activity/HistoryList';
import ActionButtons from './activity/ActionButtons';

interface ActivityFeedTabProps {
  lead: Lead;
  onSaveNotes: (notes: string) => void;
}

const ActivityFeedTab: React.FC<ActivityFeedTabProps> = ({ lead, onSaveNotes }) => {
  // Communication history - placeholder data
  const communications = [
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

  // History items - placeholder data
  const historyItems = [
    { 
      id: 1, 
      action: 'Lead created', 
      timestamp: '2025-04-16T14:30:00Z', 
      user: 'John Doe',
      icon: <UserIcon className="h-4 w-4 text-blue-500" />
    },
    { 
      id: 2, 
      action: 'Status changed to Contacted', 
      timestamp: '2025-04-16T15:45:00Z', 
      user: 'Emily Smith',
      icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />
    },
    { 
      id: 3, 
      action: 'Note added', 
      timestamp: '2025-04-16T16:20:00Z', 
      user: 'John Doe',
      icon: <MessageSquareIcon className="h-4 w-4 text-purple-500" />
    },
    { 
      id: 4, 
      action: 'Email sent', 
      timestamp: '2025-04-16T17:10:00Z', 
      user: 'System',
      icon: <MailIcon className="h-4 w-4 text-orange-500" />
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Activity Feed</h3>
          <ActionButtons />
        </div>
        
        <NotesSection lead={lead} onSaveNotes={onSaveNotes} />
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              {lead.notes && (
                <div className="border rounded-md overflow-hidden mb-4">
                  <div className="flex items-center bg-muted/30 p-3 border-b">
                    <div className="bg-white p-2 rounded-full mr-3">
                      <MessageSquareIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Lead Notes</h4>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="whitespace-pre-wrap">{lead.notes}</div>
                  </div>
                </div>
              )}
              
              <CommunicationsList communications={communications} />
              <HistoryList historyItems={historyItems} />
            </div>
          </TabsContent>
          
          <TabsContent value="communication">
            <CommunicationsList communications={communications} />
          </TabsContent>
          
          <TabsContent value="notes">
            <div className="p-4">
              <div className="border rounded-md p-4 whitespace-pre-wrap">
                {lead.notes || 'No notes available for this lead.'}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <HistoryList historyItems={historyItems} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityFeedTab;
