
import React from 'react';
import TemplateSearch from './TemplateSearch';
import TemplatesGrid from './TemplatesGrid';

interface Template {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'email' | 'sms';
}

interface TemplatesSectionProps {
  templates: Template[];
  searchTemplates: string;
  onSearchChange: (value: string) => void;
  onUseTemplate: (id: string) => void;
  onTemplateAction: (action: string, id: string) => void;
}

const TemplatesSection: React.FC<TemplatesSectionProps> = ({
  templates,
  searchTemplates,
  onSearchChange,
  onUseTemplate,
  onTemplateAction
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Message Templates</h2>
        <TemplateSearch 
          searchValue={searchTemplates} 
          onSearchChange={onSearchChange} 
        />
      </div>
      
      <TemplatesGrid 
        templates={templates}
        onUseTemplate={onUseTemplate}
        onTemplateAction={onTemplateAction}
      />
    </>
  );
};

export default TemplatesSection;
