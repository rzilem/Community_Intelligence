import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AIAnalyticsDashboard } from '@/components/ai-analytics/AIAnalyticsDashboard';
import { Brain } from 'lucide-react';

export default function AIAnalyticsDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">AI Analytics Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive AI-powered analytics and insights for your HOA management.
        </p>
        <AIAnalyticsDashboard />
      </div>
    </AppLayout>
  );
}