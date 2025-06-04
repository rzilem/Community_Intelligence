
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Briefcase } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OnboardingTemplates from '@/components/onboarding/OnboardingTemplates';
import ProposalTemplateManager from '@/components/proposals/ProposalTemplateManager';
import EmailTemplateManager from '@/components/emails/EmailTemplateManager';

const Templates = () => {
  return (
    <PageTemplate 
      title="Templates" 
      icon={<Briefcase className="h-8 w-8" />}
      description="Manage templates for onboarding, proposals, and email campaigns."
    >
      <Tabs defaultValue="onboarding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="onboarding">Onboarding Templates</TabsTrigger>
          <TabsTrigger value="proposals">Proposal Templates</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="onboarding">
          <OnboardingTemplates />
        </TabsContent>
        
        <TabsContent value="proposals">
          <ProposalTemplateManager />
        </TabsContent>
        
        <TabsContent value="emails">
          <EmailTemplateManager />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default Templates;
