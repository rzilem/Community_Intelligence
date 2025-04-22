
import React, { useState, useCallback } from 'react';
import { XCircle } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { FormField, FormTemplate } from '@/types/form-builder-types';
import FormTemplateFieldsManager from './FormTemplateFieldsManager';
import FormWorkflowIntegration from './FormWorkflowIntegration';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { useFormTemplate } from '@/hooks/form-builder/useFormTemplate';
// Extracted and refactored:
import FormDetailsSection from './editor/FormDetailsSection';
import FieldSettingsSidebar from './editor/FieldSettingsSidebar';

interface FormTemplateEditorProps {
  formId: string;
  onSave?: (form: FormTemplate) => void;
  onCancel?: () => void;
}

const FormTemplateEditor: React.FC<FormTemplateEditorProps> = ({ formId, onSave, onCancel }) => {
  const { template, loading, setTemplate } = useFormTemplate(formId);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: updateTemplate } = useSupabaseUpdate<FormTemplate>('form_templates', {
    onSuccess: () => {
      toast.success('Form template updated successfully');
      template && onSave?.(template);
    },
    onError: (error: any) => {
      console.error('Error updating form template:', error);
      toast.error('Failed to update form template');
    },
  });

  const { mutate: deleteTemplate } = useSupabaseDelete('form_templates', {
    onSuccess: () => {
      toast.success('Form template deleted successfully');
      onCancel?.();
    },
    onError: (error: any) => {
      console.error('Error deleting form template:', error);
      toast.error('Failed to delete form template');
    },
  });

  if (loading || !template) {
    return <div className="p-8 text-center text-muted-foreground">Loading form template...</div>;
  }

  const handleFieldChange = (field: FormField) => {
    setTemplate((prev: FormTemplate | null) =>
      prev
        ? {
            ...prev,
            fields: prev.fields.map((f) => (f.id === field.id ? field : f)),
          }
        : prev
    );
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(7),
      type: 'text',
      label: 'New Field',
      required: false,
    };

    setTemplate((prev: FormTemplate | null) =>
      prev
        ? { ...prev, fields: [...prev.fields, newField] }
        : prev
    );
    setSelectedFieldId(newField.id);
  };

  const handleDeleteField = (id: string) => {
    setTemplate((prev: FormTemplate | null) =>
      prev
        ? { ...prev, fields: prev.fields.filter((field) => field.id !== id) }
        : prev
    );
    setSelectedFieldId(null);
  };

  const handleTemplateDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate((prev: FormTemplate | null) =>
      prev
        ? { ...prev, [name]: value }
        : prev
    );
  };

  const handleIsPublicChange = (checked: boolean) => {
    setTemplate((prev: FormTemplate | null) =>
      prev
        ? { ...prev, is_public: checked }
        : prev
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTemplate({ id: template.id, data: template });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    deleteTemplate(template.id);
  };

  const handleReorder = useCallback((activeId: string, overId: string) => {
    setTemplate((prev: FormTemplate | null) => {
      if (!prev) return prev;
      const activeIndex = prev.fields.findIndex((field) => field.id === activeId);
      const overIndex = prev.fields.findIndex((field) => field.id === overId);
      if (activeIndex === -1 || overIndex === -1) return prev;
      return {
        ...prev,
        fields: arrayMove(prev.fields, activeIndex, overIndex),
      };
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Form Details Section */}
        <FormDetailsSection
          template={template}
          onTemplateDetailsChange={handleTemplateDetailsChange}
          onIsPublicChange={handleIsPublicChange}
        />

        {/* Form Fields Section */}
        <div className="space-y-4">
          <FormTemplateFieldsManager
            fields={template.fields}
            onReorder={handleReorder}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onDeleteField={handleDeleteField}
            onAddField={handleAddField}
          />
        </div>
      </div>
      {/* Sidebar */}
      <div className="space-y-4">
        <FieldSettingsSidebar
          selectedFieldId={selectedFieldId}
          template={template}
          onFieldChange={handleFieldChange}
          onDeleteField={handleDeleteField}
        />

        <FormWorkflowIntegration formId={formId} />

        <div className="space-y-2">
          <Button variant="default" onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="w-full">
            <XCircle className="h-4 w-4 mr-2" />
            Delete Form
          </Button>
          <Separator />
          <Button variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormTemplateEditor;
