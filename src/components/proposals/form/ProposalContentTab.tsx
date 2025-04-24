
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/lead-types';
import { ProposalTemplate } from '@/types/proposal-types';
import ProposalContentForm from '../ProposalContentForm';
import ProposalBuilder from '../interactive-builder/ProposalBuilder';

interface ProposalContentTabProps {
  leads: Lead[];
  templates: ProposalTemplate[];
  templatesLoading: boolean;
  onTemplateChange: (templateId: string) => void;
  showLeadSelector?: boolean;
  useAdvancedEditor: boolean;
  onToggleEditor: () => void;
  onAdvancedContentSave: (content: string, sections: any[]) => void;
}

const ProposalContentTab: React.FC<ProposalContentTabProps> = ({
  leads,
  templates,
  templatesLoading,
  onTemplateChange,
  showLeadSelector,
  useAdvancedEditor,
  onToggleEditor,
  onAdvancedContentSave,
}) => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Proposal Content</h3>
        <Button
          type="button"
          variant="outline"
          onClick={onToggleEditor}
        >
          {useAdvancedEditor ? 'Switch to Basic Editor' : 'Switch to Advanced Editor'}
        </Button>
      </div>
      
      {useAdvancedEditor ? (
        <div className="border rounded-md">
          <ProposalBuilder
            initialContent={form.getValues('content')}
            onSave={onAdvancedContentSave}
            proposalId={form.getValues('id')}
          />
        </div>
      ) : (
        <ProposalContentForm 
          leads={leads}
          templates={templates}
          templatesLoading={templatesLoading}
          onTemplateChange={onTemplateChange}
          showLeadSelector={showLeadSelector}
        />
      )}
    </div>
  );
};

export default ProposalContentTab;
