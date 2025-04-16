
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MailIcon, PhoneIcon, CalendarIcon, MessageSquareIcon, ClockIcon, PlusIcon, UserIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { Lead } from '@/types/lead-types';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';

interface ActivityFeedTabProps {
  lead: Lead;
  onSaveNotes: (notes: string) => void;
}

const ActivityFeedTab: React.FC<ActivityFeedTabProps> = ({ lead, onSaveNotes }) => {
  const [newNote, setNewNote] = useState('');
  
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

  const getCommunicationIcon = (type: string) => {
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

  const handleAddNote = () => {
    if (newNote.trim()) {
      onSaveNotes(lead.notes ? `${lead.notes}\n\n${new Date().toLocaleString()}: ${newNote}` : `${new Date().toLocaleString()}: ${newNote}`);
      setNewNote('');
      toast.success('Note added successfully');
    } else {
      toast.error('Note cannot be empty');
    }
  };

  // Render action buttons for adding new communications
  const renderActionButtons = () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" className="flex items-center gap-2">
        <MailIcon className="h-4 w-4" />
        Send Email
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4" />
        Schedule Meeting
      </Button>
    </div>
  );

  // Render a communication item
  const renderCommunicationItem = (comm: any) => (
    <div key={comm.id} className="border rounded-md overflow-hidden mb-4">
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Activity Feed</h3>
          {renderActionButtons()}
        </div>
        
        <div className="mb-6">
          <div className="border rounded-md p-4 mb-4">
            <label htmlFor="new-note" className="block text-sm font-medium mb-2">Leave a Note</label>
            <Textarea 
              id="new-note"
              placeholder="Type your note here..." 
              value={newNote} 
              onChange={(e) => setNewNote(e.target.value)}
              className="mb-3 min-h-[100px]"
            />
            <Button onClick={handleAddNote} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Note
            </Button>
          </div>
        </div>
        
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
                    <ScrollArea className="h-[200px]">
                      <div className="whitespace-pre-wrap">{lead.notes}</div>
                    </ScrollArea>
                  </div>
                </div>
              )}
              
              {communications.map(renderCommunicationItem)}
              
              {historyItems.map((item) => (
                <div key={item.id} className="flex items-start p-3 border rounded-md bg-muted/20">
                  <div className="bg-muted rounded-full p-2 mr-3">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">By: {item.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="communication">
            <div className="space-y-4">
              {communications.length > 0 ? 
                communications.map(renderCommunicationItem) : 
                <p className="text-muted-foreground text-center py-8">
                  No communication history available for this lead.
                </p>
              }
            </div>
          </TabsContent>
          
          <TabsContent value="notes">
            <div className="p-4">
              <div className="border rounded-md p-4 whitespace-pre-wrap">
                {lead.notes || 'No notes available for this lead.'}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              {historyItems.length > 0 ? 
                historyItems.map((item) => (
                  <div key={item.id} className="flex items-start p-3 border rounded-md bg-muted/20">
                    <div className="bg-muted rounded-full p-2 mr-3">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">By: {item.user}</p>
                    </div>
                  </div>
                )) : 
                <p className="text-muted-foreground text-center py-8">
                  No history records available for this lead.
                </p>
              }
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityFeedTab;
