
import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { AiQueryInput } from '@/components/ai/AiQueryInput';

const KnowledgeBasePage = () => {
  const [activeTab, setActiveTab] = useState('ai-assistant');

  return (
    <PortalPageLayout 
      title="Board Member Knowledge Base" 
      icon={<BookOpen className="h-6 w-6" />}
      description="Access AI assistance, training materials, news, and educational content"
      portalType="board"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="board" />
        </div>
        
        <div className="lg:col-span-3">
          <Card className="p-6">
            <Tabs defaultValue="ai-assistant" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="videos">Video Education</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-assistant" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium mb-4">Ask Community Intelligence</h3>
                  <AiQueryInput />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium">What are my responsibilities as a board member?</p>
                    </div>
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium">How do I handle homeowner disputes?</p>
                    </div>
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium">What should I know about our reserve funds?</p>
                    </div>
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium">How can I improve community engagement?</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="training" className="mt-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Board Portal Training</h3>
                  <p className="text-muted-foreground">This section contains comprehensive training materials for board members.</p>
                  
                  <div className="mt-6 space-y-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Getting Started</h4>
                      <p className="text-sm text-muted-foreground">Learn the basics of using the board portal and its key features.</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Advanced Features</h4>
                      <p className="text-sm text-muted-foreground">Explore advanced functionality and management tools.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="news" className="mt-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Board Member News</h3>
                  <div className="rounded-md border">
                    <iframe 
                      src="https://psprop.net/hoa-board-member-news/"
                      className="w-full h-[600px] rounded-md"
                      title="Board Member News"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="videos" className="mt-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Board Member Video Education</h3>
                  <p className="text-muted-foreground mb-6">Access educational videos designed specifically for board members.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Board Member Responsibilities</h4>
                      <p className="text-sm text-muted-foreground mb-4">Understanding your role and duties as a board member.</p>
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Video content coming soon</p>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Financial Management</h4>
                      <p className="text-sm text-muted-foreground mb-4">Learn about HOA financial responsibilities and best practices.</p>
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Video content coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default KnowledgeBasePage;
