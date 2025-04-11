
import React from 'react';
import MessageTemplateCard from '@/components/communications/MessageTemplateCard';

interface Template {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'email' | 'sms';
}

interface TemplatesGridProps {
  templates: Template[];
  onUseTemplate: (id: string) => void;
  onTemplateAction: (action: string, id: string) => void;
}

const TemplatesGrid: React.FC<TemplatesGridProps> = ({
  templates,
  onUseTemplate,
  onTemplateAction
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(template => (
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
