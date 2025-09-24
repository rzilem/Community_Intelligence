import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, MessageSquare, BarChart, FileText, Zap } from 'lucide-react';
import { AiQueryInput } from '@/components/ai/AiQueryInput';

export default function AIAssistant() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Your intelligent HOA management assistant - ask me anything about your community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Chat Interface */}
        <div className="lg:col-span-3">
          <AiQueryInput />
        </div>

        {/* AI Capabilities Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-1 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Natural Language Queries</p>
                    <p className="text-xs text-muted-foreground">Ask questions in plain English</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <BarChart className="h-4 w-4 mt-1 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Data Analysis</p>
                    <p className="text-xs text-muted-foreground">Get insights from your HOA data</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Document Processing</p>
                    <p className="text-xs text-muted-foreground">Search and analyze documents</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Example Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm bg-muted p-2 rounded">
                  "Show me all overdue assessments"
                </p>
                <p className="text-sm bg-muted p-2 rounded">
                  "What maintenance requests are pending?"
                </p>
                <p className="text-sm bg-muted p-2 rounded">
                  "Generate a monthly financial report"
                </p>
                <p className="text-sm bg-muted p-2 rounded">
                  "How many violations were reported this month?"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}