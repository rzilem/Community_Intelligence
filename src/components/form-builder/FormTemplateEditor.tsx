
import React, { useState, useEffect, useCallback } from "react";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { FormTemplate } from "@/types/form-builder-types";
import FormTemplateFieldsManager from "./FormTemplateFieldsManager";
import FormWorkflowIntegration from "./FormWorkflowIntegration";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSupabaseUpdate, useSupabaseDelete } from "@/hooks/supabase";
import { useFormTemplate } from "@/hooks/form-builder/useFormTemplate";
import FormDetailsSection from "./editor/FormDetailsSection";
import FieldSettingsSidebar from "./editor/FieldSettingsSidebar";
import { useFormTemplateState } from "./editor/useFormTemplateState";

interface FormTemplateEditorProps {
  formId: string;
  onSave?: (form: FormTemplate) => void;
  onCancel?: () => void;
}

const FormTemplateEditor: React.FC<FormTemplateEditorProps> = ({ formId, onSave, onCancel }) => {
  const { template: loadedTemplate, loading } = useFormTemplate(formId);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    template,
    setTemplate,
    updateField,
    addField,
    deleteField,
    updateTemplateDetails,
    updateIsPublic,
    reorderFields
  } = useFormTemplateState(loadedTemplate);

  useEffect(() => {
    setTemplate(loadedTemplate);
  }, [loadedTemplate, setTemplate]);

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

  const handleAddField = () => {
    const newId = addField();
    setSelectedFieldId(newId);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <FormDetailsSection
          template={template}
          onTemplateDetailsChange={updateTemplateDetails}
          onIsPublicChange={updateIsPublic}
        />
        <div className="space-y-4">
          <FormTemplateFieldsManager
            fields={template.fields}
            onReorder={reorderFields}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onDeleteField={deleteField}
            onAddField={handleAddField}
          />
        </div>
      </div>
      <div className="space-y-4">
        <FieldSettingsSidebar
          selectedFieldId={selectedFieldId}
          template={template}
          onFieldChange={updateField}
          onDeleteField={deleteField}
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
