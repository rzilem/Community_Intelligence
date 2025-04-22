
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Send, User, UserPlus, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { MessageHistoryTable } from '@/components/communications/MessageHistoryTable';
import { messageService } from '@/services/communications/message-service';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { format } from 'date-fns';

const MessagingPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('compose');
  const [loading, setLoading] = useState(false);
  const [messageData, setMessageData] = useState({
    subject: '',
    content: '',
    type: 'email' as 'email' | 'sms',
    scheduledFor: undefined as Date | undefined,
    recipientGroups: [] as string[]
  });

  // Mock data for recipient groups until Supabase is properly connected
  const recipientGroups = [
    { id: 'all-residents', name: 'All Residents', group_type: 'system' },
    { id: 'board-members', name: 'Board Members', group_type: 'system' },
    { id: 'homeowners', name: 'Homeowners', group_type: 'system' },
  ];

  const handleSendMessage = async () => {
    if (!messageData.subject.trim()) {
      toast({
        title: 'Subject Required',
        description: 'Please enter a subject for your message.',
        variant: 'destructive'
      });
      return;
    }

    if (!messageData.content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter content for your message.',
        variant: 'destructive'
      });
      return;
    }

    if (messageData.recipientGroups.length === 0) {
      toast({
        title: 'Recipients Required',
        description: 'Please select at least one recipient group.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Mock success for now
      setTimeout(() => {
        toast({
          title: messageData.scheduledFor ? 'Message Scheduled' : 'Message Sent',
          description: messageData.scheduledFor 
            ? `Your message has been scheduled for ${format(messageData.scheduledFor, 'PPP')}` 
            : 'Your message has been sent successfully.'
        });

        // Reset form
        setMessageData({
          subject: '',
          content: '',
          type: 'email',
          scheduledFor: undefined,
          recipientGroups: []
        });
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message Type</label>
                    <Select 
                      value={messageData.type}
                      onValueChange={(value) => setMessageData({...messageData, type: value as 'email' | 'sms'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Schedule (Optional)</label>
                    <DatePicker 
                      date={messageData.scheduledFor} 
                      setDate={(date) => setMessageData({...messageData, scheduledFor: date})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input 
                    placeholder="Message subject"
                    value={messageData.subject}
                    onChange={(e) => setMessageData({...messageData, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipients</label>
                  <Select 
                    value={messageData.recipientGroups.length > 0 ? messageData.recipientGroups[0] : ''}
                    onValueChange={(value) => setMessageData({...messageData, recipientGroups: [value]})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient group" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipientGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Content</label>
                  <Textarea 
                    placeholder="Type your message here..."
                    rows={10}
                    value={messageData.content}
                    onChange={(e) => setMessageData({...messageData, content: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="w-full md:w-auto" 
                  onClick={handleSendMessage}
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : messageData.scheduledFor ? 'Schedule Message' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                Your message history will appear here. You can view, resend, or delete previous messages.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Subject</th>
                      <th className="text-left py-3 px-4">Recipients</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center py-8">
                      <td colSpan={6} className="py-8">No message history found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingPage;
