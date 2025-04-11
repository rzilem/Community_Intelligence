import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Users, 
  Sparkles,
  Tags,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import MessageTemplateCard from '@/components/communications/MessageTemplateCard';
import MessageHistoryTable, { MessageHistoryItem } from '@/components/communications/MessageHistoryTable';
import RecipientSelector from '@/components/communications/RecipientSelector';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { communicationService } from '@/services/communication-service';

const mockHistoryData: MessageHistoryItem[] = [
  {
    id: '1',
    subject: 'Community Meeting Reminder',
    type: 'email',
    recipients: 145,
    sentDate: '2025-04-01',
    status: 'sent',
    openRate: 72
  },
  {
    id: '2',
    subject: 'Upcoming Pool Closure',
    type: 'email',
    recipients: 145,
    sentDate: '2025-03-25',
    status: 'sent',
    openRate: 68
  },
  {
    id: '3',
    subject: 'Maintenance Update',
    type: 'sms',
    recipients: 132,
    sentDate: '2025-04-05',
    status: 'scheduled'
  },
  {
    id: '4',
    subject: 'Emergency Water Shutdown',
    type: 'sms',
    recipients: 145,
    sentDate: '2025-03-15',
    status: 'sent',
    openRate: 91
  },
  {
    id: '5',
    subject: 'Failed Newsletter',
    type: 'email',
    recipients: 145,
    sentDate: '2025-03-10',
    status: 'failed'
  }
];

const mockTemplates = [
  {
    id: '1',
    title: 'Welcome New Resident',
    description: 'Introduction email for new residents with community guidelines and important contacts.',
    date: '2025-03-15',
    type: 'email' as const
  },
  {
    id: '2',
    title: 'Maintenance Notice',
    description: 'Template for upcoming maintenance work in the community.',
    date: '2025-02-28',
    type: 'email' as const
  },
  {
    id: '3',
    title: 'Emergency Alert',
    description: 'Short text message for urgent community notifications.',
    date: '2025-03-01',
    type: 'sms' as const
  },
  {
    id: '4',
    title: 'Payment Reminder',
    description: 'Friendly reminder about upcoming HOA dues.',
    date: '2025-03-10',
    type: 'email' as const
  }
];

const MessagingPage = () => {
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');

  const [searchHistory, setSearchHistory] = useState('');
  const [searchTemplates, setSearchTemplates] = useState('');

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const data = await communicationService.getAllAssociations();
        setAssociations(data);
        if (data.length > 0) {
          setSelectedAssociationId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching associations:', error);
      }
    };

    fetchAssociations();
  }, []);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setSelectedGroups([]); // Clear selected groups when association changes
  };

  const handleViewMessage = (id: string) => {
    console.log(`Viewing message ${id}`);
    // Implementation for viewing message details
  };

  const handleResendMessage = (id: string) => {
    console.log(`Resending message ${id}`);
    // Implementation for resending a failed message
  };

  const handleUseTemplate = (id: string) => {
    console.log(`Using template ${id}`);
    // Implementation for using a template
    setActiveTab('compose');
    // In a real app, we'd load the template content here
    const template = mockTemplates.find(t => t.id === id);
    if (template) {
      setSubject(`[Template] ${template.title}`);
      setMessageContent(`This is content from the "${template.title}" template.`);
      setMessageType(template.type);
    }
  };

  const handleTemplateAction = (action: string, id: string) => {
    console.log(`${action} template ${id}`);
    // Implementation for template actions
  };

  const handleSendMessage = async () => {
    if (!subject || !messageContent || selectedGroups.length === 0) {
      toast.error('Please fill out all required fields and select at least one recipient group');
      return;
    }

    setIsLoading(true);

    try {
      await communicationService.sendMessage({
        subject,
        content: messageContent,
        association_id: selectedAssociationId,
        recipient_groups: selectedGroups,
        type: messageType
      });

      // Reset form
      setSubject('');
      setMessageContent('');
      setSelectedGroups([]);
      setActiveTab('history');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="compose" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 rounded-lg bg-muted">
          <TabsTrigger value="compose" className="text-base">Compose Message</TabsTrigger>
          <TabsTrigger value="history" className="text-base">Message History</TabsTrigger>
          <TabsTrigger value="templates" className="text-base">Message Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compose" className="space-y-6">
          <h2 className="text-2xl font-semibold">Compose Message</h2>
          
          <div className="bg-white rounded-lg border p-6 space-y-6">            
            <div className="space-y-2">
              <label className="block font-medium">Message Type</label>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant={messageType === 'email' ? 'default' : 'outline'}
                  className={`flex-1 gap-2 ${messageType === 'email' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setMessageType('email')}
                >
                  <Mail className="h-5 w-5" />
                  Email
                </Button>
                <Button 
                  type="button" 
                  variant={messageType === 'sms' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setMessageType('sms')}
                >
                  <MessageSquare className="h-5 w-5" />
                  SMS
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block font-medium">Association</label>
                <AssociationSelector 
                  onAssociationChange={handleAssociationChange}
                  initialAssociationId={selectedAssociationId}
                  label={false}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-medium">Recipients</label>
                </div>
                <RecipientSelector 
                  onSelectionChange={setSelectedGroups} 
                  associationId={selectedAssociationId}
                />
                {selectedGroups.length === 0 && (
                  <div className="flex items-center border rounded-md p-4 text-amber-600 bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>No recipients selected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="subject" className="block font-medium">Subject</label>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setActiveTab('templates')}
                >
                  <FileText className="h-4 w-4" />
                  Use Template
                </Button>
              </div>
              <div className="relative">
                <Input 
                  id="subject"
                  placeholder="Enter message subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="pr-10"
                />
                {!subject && (
                  <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="content" className="block font-medium">Message Content</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <Select defaultValue="plaintext">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plaintext">Plain Text</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Tags className="h-4 w-4" />
                    Merge Tags
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Assist
                  </Button>
                </div>
              </div>
              <Textarea
                id="content"
                placeholder="Enter your message content here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="min-h-[300px]"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setSubject('');
                setMessageContent('');
                setSelectedGroups([]);
              }}>
                Cancel
              </Button>
              <Button 
                disabled={!subject || !messageContent || selectedGroups.length === 0 || isLoading}
                onClick={handleSendMessage}
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Message History</h2>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages"
                  className="pl-9 w-[250px]"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <MessageHistoryTable 
                messages={mockHistoryData} 
                onViewMessage={handleViewMessage}
                onResend={handleResendMessage}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Message Templates</h2>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates"
                  className="pl-9 w-[250px]"
                  value={searchTemplates}
                  onChange={(e) => setSearchTemplates(e.target.value)}
                />
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTemplates.map(template => (
              <MessageTemplateCard 
                key={template.id}
                title={template.title}
                description={template.description}
                date={template.date}
                type={template.type}
                onUse={() => handleUseTemplate(template.id)}
                onEdit={() => handleTemplateAction('edit', template.id)}
                onDuplicate={() => handleTemplateAction('duplicate', template.id)}
                onDelete={() => handleTemplateAction('delete', template.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingPage;
