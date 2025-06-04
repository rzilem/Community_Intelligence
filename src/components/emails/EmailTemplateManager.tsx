import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmailTemplateList from './EmailTemplateList';
import EmailTemplateForm from './EmailTemplateForm';
import { useEmailTemplates } from '@/hooks/emails/useEmailTemplates';
import { EmailTemplate } from '@/types/email-types';
import { toast } from 'sonner';

const EmailTemplateManager: React.FC = () => {
  const { createTemplate, updateTemplate } = useEmailTemplates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);

  const handleCreate = () => {
    setCurrentTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setIsFormOpen(true);
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const duplicated = {
      ...template,
      id: undefined,
      name: `${template.name} (Copy)`
    } as EmailTemplate;
    setCurrentTemplate(duplicated);
    setIsFormOpen(true);
  };

  const handleSave = async (data: Partial<EmailTemplate>) => {
    try {
      if (data.id) {
        await updateTemplate({ id: data.id, data });
      } else {
        await createTemplate(data);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>
      <EmailTemplateList
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={() => {}}
      />
      {isFormOpen && (
        <EmailTemplateForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          template={currentTemplate || undefined}
        />
      )}
    </div>
  );
};

export default EmailTemplateManager;
