
import React from 'react';
import { MessageTemplate } from '@/pages/communications/messaging/MessagingData';
import MessageTemplateCard from '@/components/communications/MessageTemplateCard';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

export interface TemplatesGridProps {
  templates: MessageTemplate[];
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
  // Filter templates based on search value
  const filteredTemplates = searchValue.trim() === ''
    ? templates
    : templates.filter(template => 
        template.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        template.description.toLowerCase().includes(searchValue.toLowerCase())
      );
  
  if (filteredTemplates.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-10 w-10" />}
        title="No templates found"
        description={searchValue.trim() !== '' 
          ? `No templates match "${searchValue}". Try a different search.` 
          : "No templates have been created yet."}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTemplates.map(template => (
        <MessageTemplateCard
          key={template.id}
          title={template.title}
          description={template.description}
          date={template.date}
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
