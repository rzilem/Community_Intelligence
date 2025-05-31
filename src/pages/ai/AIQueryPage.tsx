
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Brain } from 'lucide-react';
import AIQueryInterface from '@/components/ai/AIQueryInterface';

const AIQueryPage: React.FC = () => {
  return (
    <PageTemplate
      title="AI Query Assistant"
      icon={<Brain className="h-8 w-8" />}
      description="Ask questions about your HOA data in natural language"
    >
      <AIQueryInterface />
    </PageTemplate>
  );
};

export default AIQueryPage;
