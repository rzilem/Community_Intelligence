
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import AIQueryInterface from '@/components/ai/AIQueryInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Database, 
  MessageSquare, 
  BarChart3,
  Users,
  Home,
  Wrench
} from 'lucide-react';

const AIQueryPage: React.FC = () => {
  return (
    <PageTemplate
      title="AI Query System"
      icon={<Brain className="h-8 w-8 text-blue-600" />}
      description="Ask questions about your HOA data using natural language"
      actions={
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          MILESTONE 4: Advanced Features
        </Badge>
      }
    >
      <div className="space-y-6">
        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">AI-Powered</p>
                  <p className="text-sm text-gray-600">Natural language processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Real-time Data</p>
                  <p className="text-sm text-gray-600">Live database queries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">Contextual</p>
                  <p className="text-sm text-gray-600">Role-based responses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-medium">Insights</p>
                  <p className="text-sm text-gray-600">Smart analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5" />
                Homeowner Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIQueryInterface context="homeowners" className="h-[400px]" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-5 w-5" />
                Request Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIQueryInterface context="requests" className="h-[400px]" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Home className="h-5 w-5" />
                Property Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIQueryInterface context="properties" className="h-[400px]" />
            </CardContent>
          </Card>
        </div>

        {/* Main AI Query Interface */}
        <Card>
          <CardHeader>
            <CardTitle>General AI Query</CardTitle>
          </CardHeader>
          <CardContent>
            <AIQueryInterface />
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default AIQueryPage;
