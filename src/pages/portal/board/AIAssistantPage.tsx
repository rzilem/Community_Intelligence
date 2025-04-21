
import React from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { AiQueryInput } from '@/components/ai/AiQueryInput';

const AIAssistantPage = () => {
  return (
    <PortalPageLayout 
      title="Board Member AI Assistant" 
      icon={<Sparkles className="h-6 w-6" />}
      description="Get AI-powered assistance for board management tasks"
      portalType="board"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="board" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Ask Community Intelligence</h3>
              <AiQueryInput />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Suggested Questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default AIAssistantPage;
