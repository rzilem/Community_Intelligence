
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Import the mock data
import { mockHistoryData, mockTemplates } from './messaging/MessagingData';

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
      console.log(`Loading template: ${template.title}`);
      // This would be handled by ComposeForm now
    }
  };

  const handleTemplateAction = (action: string, id: string) => {
    console.log(`${action} template ${id}`);
    // Implementation for template actions
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
            onMessageSent={() => setActiveTab('history')}
            onUseTemplate={() => setActiveTab('templates')}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <HistorySection 
            messages={mockHistoryData}
            searchHistory={searchHistory}
            onSearchChange={setSearchHistory}
            onViewMessage={handleViewMessage}
            onResendMessage={handleResendMessage}
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
