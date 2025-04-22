
import React from 'react';
import MessageTemplateCard from '@/components/communications/MessageTemplateCard';
import { defaultEmailTemplates } from '@/components/communications/templates/DefaultEmailTemplates';

interface TemplatesGridProps {
  templates: any[];
  searchValue: string;
  onUseTemplate: (id: string) => void;
  onTemplateAction: (action: string, id: string) => void;
}

const TemplatesGrid: React.FC<TemplatesGridProps> = ({
  templates,
  searchValue,
  onUseTemplate,
  onTemplateAction
}) => {
  // Combine custom templates with default templates
  const allTemplates = [...templates, ...defaultEmailTemplates];
  
  // Filter templates based on search
  const filteredTemplates = allTemplates.filter(template => {
    const searchLower = searchValue.toLowerCase();
    return (
      template.title.toLowerCase().includes(searchLower) ||
      template.description.toLowerCase().includes(searchLower)
    );
  });

  if (filteredTemplates.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">No templates matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTemplates.map((template) => (
        <MessageTemplateCard
          key={template.id}
          title={template.title}
          description={template.description}
          date={template.created_at ? new Date(template.created_at).toLocaleDateString() : 'Default Template'}
          type={template.type}
          onUse={() => onUseTemplate(template.id)}
          onEdit={() => onTemplateAction('edit', template.id)}
          onDuplicate={() => onTemplateAction('duplicate', template.id)}
          onDelete={() => onTemplateAction('delete', template.id)}
        />
      ))}
    </div>
  );
};

export default TemplatesGrid;
