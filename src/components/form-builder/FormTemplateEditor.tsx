
import React, { useState, useEffect, useCallback } from 'react';
import { XCircle } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { FormField, FormTemplate, FormType } from '@/types/form-builder-types';
import FormTemplateFieldsManager from './FormTemplateFieldsManager';
import FormWorkflowIntegration from './FormWorkflowIntegration';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
// Extracted and refactored:
import FormDetailsSection from './editor/FormDetailsSection';
import FieldSettingsSidebar from './editor/FieldSettingsSidebar';

interface FormTemplateEditorProps {
  formId: string;
  onSave?: (form: FormTemplate) => void;
  onCancel?: () => void;
}

const FormTemplateEditor: React.FC<FormTemplateEditorProps> = ({ formId, onSave, onCancel }) => {
  const [template, setTemplate] = useState<FormTemplate>({
    id: formId,
    name: '',
    fields: [],
    created_at: '',
    updated_at: '',
    is_public: false,
    is_global: false,
    form_type: null,
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: updateTemplate } = useSupabaseUpdate<FormTemplate>('form_templates', {
    onSuccess: () => {
      toast.success('Form template updated successfully');
      onSave?.(template);
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

  useEffect(() => {
    const fetchTemplate = async () => {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) {
        toast.error('Failed to load form template');
        return;
      }

      // Parsing FormField[] as always
      let parsedFields: FormField[] = [];
      try {
        if (typeof data.fields === 'string') {
          parsedFields = JSON.parse(data.fields);
        } else if (Array.isArray(data.fields)) {
          parsedFields = data.fields as unknown as FormField[];
        }
      } catch (e) {
        console.error('Error parsing fields:', e);
        parsedFields = [];
      }

      // Fix for metadata if needed
      let metadata: Record<string, any> | undefined = undefined;
      try {
        if (data.metadata && typeof data.metadata === 'string') {
          metadata = JSON.parse(data.metadata);
        } else if (data.metadata && typeof data.metadata === 'object') {
          metadata = data.metadata;
        }
      } catch {
        metadata = undefined;
      }

      // Cast form_type to FormType or null
      let formType: FormType | null = null;
      if (data.form_type && typeof data.form_type === 'string') {
        // Check if the value matches one of the valid FormType values
        const validFormTypes: FormType[] = [
          'portal_request', 'arc_application', 'pool_form', 
          'gate_request', 'other'
        ];
        
        if (validFormTypes.includes(data.form_type as FormType)) {
          formType = data.form_type as FormType;
        }
      }

      // Compose template with correct types and conversion
      setTemplate((prev) => ({
        ...prev,
        ...data,
        form_type: formType,
        fields: parsedFields,
        metadata: metadata || {},
      }));
    };

    fetchTemplate();
  }, [formId]);

  const handleFieldChange = (field: FormField) => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      fields: prevTemplate.fields.map((f) => (f.id === field.id ? field : f)),
    }));
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(7),
      type: 'text',
      label: 'New Field',
      required: false,
    };

    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      fields: [...prevTemplate.fields, newField],
    }));

    setSelectedFieldId(newField.id);
  };

  const handleDeleteField = (id: string) => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      fields: prevTemplate.fields.filter((field) => field.id !== id),
    }));
    setSelectedFieldId(null);
  };

  const handleTemplateDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      [name]: value,
    }));
  };

  const handleIsPublicChange = (checked: boolean) => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      is_public: checked,
    }));
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
    setTemplate((prevTemplate) => {
      const activeIndex = prevTemplate.fields.findIndex((field) => field.id === activeId);
      const overIndex = prevTemplate.fields.findIndex((field) => field.id === overId);

      if (activeIndex === -1 || overIndex === -1) {
        return prevTemplate;
      }

      return {
        ...prevTemplate,
        fields: arrayMove(prevTemplate.fields, activeIndex, overIndex),
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
        {/* Field Settings Sidebar component */}
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
