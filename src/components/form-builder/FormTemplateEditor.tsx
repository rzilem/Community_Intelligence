import React, { useState, useEffect, useCallback } from 'react';
import { XCircle, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { FormField, FormTemplate } from '@/types/form-builder-types';
import FormFieldEditor from './FormFieldEditor';
import FormFieldsList from './FormFieldsList';
import { FormAssociationSelect } from './FormAssociationSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import FormWorkflowIntegration from './FormWorkflowIntegration';
import { supabase } from '@/integrations/supabase/client';

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
    form_type: null
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: updateTemplate } = useSupabaseUpdate<FormTemplate>('form_templates', {
    onSuccess: () => {
      toast.success('Form template updated successfully');
      onSave?.(template);
    },
    onError: (error) => {
      console.error('Error updating form template:', error);
      toast.error('Failed to update form template');
    }
  });

  const { mutate: deleteTemplate } = useSupabaseDelete('form_templates', {
    onSuccess: () => {
      toast.success('Form template deleted successfully');
      onCancel?.();
    },
    onError: (error) => {
      console.error('Error deleting form template:', error);
      toast.error('Failed to delete form template');
    }
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

      let parsedFields: FormField[] = [];
      try {
        if (typeof data.fields === 'string') {
          parsedFields = JSON.parse(data.fields);
        } else if (Array.isArray(data.fields)) {
          parsedFields = data.fields;
        } else {
          console.warn('Unexpected fields format:', data.fields);
          parsedFields = [];
        }
      } catch (e) {
        console.error('Error parsing fields:', e);
        parsedFields = [];
      }

      const formTemplate: FormTemplate = {
        ...data,
        fields: parsedFields
      };
      
      setTemplate(formTemplate);
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

  const SortableItem = ({ field }: { field: FormField }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: field.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
      >
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 mr-2 opacity-50 cursor-grab" />
          <span className="font-medium">{field.label}</span>
          <span className="text-xs text-muted-foreground ml-2">
            ({field.type})
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>Edit the basic details of your form.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={template.name}
                  onChange={handleTemplateDetailsChange}
                />
              </div>
              <div>
                <Label htmlFor="is_public">Public Form</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={template.is_public}
                    onCheckedChange={handleIsPublicChange}
                  />
                  <span>Allow anyone to submit this form</span>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={template.description || ''}
                onChange={handleTemplateDetailsChange}
              />
            </div>
            <FormAssociationSelect
              formId={template.id}
              isGlobal={template.is_global}
              associations={[]}
              onUpdate={() => {}}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
            <CardDescription>Drag and drop to reorder, edit, or delete fields.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormFieldsList
              fields={template.fields}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onDeleteField={handleDeleteField}
              onAddField={handleAddField}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {selectedFieldId && (
          <Card>
            <CardHeader>
              <CardTitle>Field Settings</CardTitle>
              <CardDescription>Customize the settings for the selected field.</CardDescription>
            </CardHeader>
            <CardContent>
              {template.fields.find((field) => field.id === selectedFieldId) && (
                <FormFieldEditor
                  field={template.fields.find((field) => field.id === selectedFieldId) as FormField}
                  onChange={handleFieldChange}
                  onDelete={() => handleDeleteField(selectedFieldId)}
                />
              )}
            </CardContent>
          </Card>
        )}

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
