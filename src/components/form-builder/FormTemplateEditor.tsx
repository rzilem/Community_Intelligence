
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormTemplate, FormField, FormFieldType } from '@/types/form-builder-types';
import FormFieldsList from './FormFieldsList';
import FormFieldEditor from './FormFieldEditor';
import { FormAssociationSelect } from './FormAssociationSelect';
import FormWorkflowIntegration from './FormWorkflowIntegration';
import { Button } from '@/components/ui/button';
import { Save, Plus } from 'lucide-react';

interface FormTemplateEditorProps {
  formId: string;
  form?: FormTemplate;
  onSave: (form: FormTemplate) => Promise<void>;
  isSaving?: boolean;
}

const FormTemplateEditor: React.FC<FormTemplateEditorProps> = ({
  formId,
  form,
  onSave,
  isSaving = false
}) => {
  const [activeTab, setActiveTab] = useState('fields');
  const [formData, setFormData] = useState<FormTemplate>(
    form || {
      id: formId,
      name: 'New Form',
      description: '',
      fields: [],
      is_global: false,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      form_type: null
    }
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const handleAddField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: 'text' as FormFieldType,
      label: 'New Field',
      placeholder: '',
      required: false,
      validation: {}
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    setSelectedFieldId(newField.id);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const handleDeleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };
  
  const handleSaveForm = async () => {
    await onSave({
      ...formData,
      updated_at: new Date().toISOString()
    });
  };

  const selectedField = selectedFieldId
    ? formData.fields.find(field => field.id === selectedFieldId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{form ? 'Edit Form' : 'Create Form'}</h2>
        <Button onClick={handleSaveForm} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Form'}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="fields">Form Fields</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fields" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Form Fields</span>
                    <Button size="sm" variant="ghost" onClick={handleAddField}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormFieldsList
                    fields={formData.fields}
                    selectedFieldId={selectedFieldId}
                    onSelectField={setSelectedFieldId}
                    onDeleteField={handleDeleteField}
                    onAddField={handleAddField}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedField ? (
                <FormFieldEditor
                  field={selectedField}
                  onChange={(updates) => handleUpdateField(selectedField.id, updates)}
                  onDelete={() => handleDeleteField(selectedField.id)}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Select a field to edit or add a new field</p>
                    <Button onClick={handleAddField}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="workflows">
          <FormWorkflowIntegration formId={formId} />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <FormAssociationSelect
                formId={formId}
                isGlobal={formData.is_global}
                onGlobalChange={(isGlobal) => setFormData(prev => ({ ...prev, is_global: isGlobal }))}
                associations={[]}
                onUpdate={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormTemplateEditor;
