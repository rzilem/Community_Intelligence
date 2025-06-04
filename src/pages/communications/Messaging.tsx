import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Import the mock data for templates (we'll keep using these for now)
import { mockTemplates } from './messaging/MessagingData';

// Import component sections
import ComposeForm from '@/components/communications/messaging/ComposeForm';
import HistorySection from '@/components/communications/messaging/HistorySection';
import TemplatesSection from '@/components/communications/messaging/TemplatesSection';

const MessagingPage = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [searchHistory, setSearchHistory] = useState('');
  const [searchTemplates, setSearchTemplates] = useState('');

  const handleViewMessage = (id: string) => {
    console.log(`Viewing message ${id}`);
    toast.info(`Message details for ID: ${id}`);
    // Implementation for viewing message details would go here
  };

  const handleUseTemplate = (id: string) => {
    console.log(`Using template ${id}`);
    setActiveTab('compose');
    const template = mockTemplates.find(t => t.id === id);
    if (template) {
      toast.success(`Template "${template.title}" loaded`);
      // The template loading would be handled by the ComposeForm
    }
  };

  const handleTemplateAction = (action: string, id: string) => {
    console.log(`${action} template ${id}`);
    toast.info(`Template ${action} action for ID: ${id}`);
    // Implementation for template actions (edit, delete, duplicate)
  };

  const handleMessageSent = () => {
    toast.success('Message sent successfully!');
    setActiveTab('history');
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
          <ComposeForm 
            onMessageSent={handleMessageSent}
            onUseTemplate={() => setActiveTab('templates')}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <HistorySection 
            messages={[]} // HistorySection will load its own data
            searchHistory={searchHistory}
            onSearchChange={setSearchHistory}
            onViewMessage={handleViewMessage}
            onResendMessage={() => {}} // Handled internally by HistorySection
          />
        </TabsContent>
        
        <TabsContent value="templates">
          <TemplatesSection 
            templates={mockTemplates}
            searchTemplates={searchTemplates}
            onSearchChange={setSearchTemplates}
            onUseTemplate={handleUseTemplate}
            onTemplateAction={handleTemplateAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingPage;
