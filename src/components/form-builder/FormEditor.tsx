
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, MoveUp, MoveDown, Save, Settings } from 'lucide-react';
import { FormTemplate, FormField, FormFieldType } from '@/types/form-builder-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSupabaseUpdate, useSupabaseQuery } from '@/hooks/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormPreview from './FormPreview';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

interface FormEditorProps {
  templateId: string;
  onComplete?: () => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({ templateId, onComplete }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fields');
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fieldBeingEdited, setFieldBeingEdited] = useState<FormField | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the form template
  const { data, isLoading: templateLoading } = useSupabaseQuery<FormTemplate>(
    'form_templates',
    {
      select: '*',
      filter: [{ column: 'id', value: templateId }]
    },
    !!templateId
  );

  // Update mutation
  const { mutate: updateTemplate } = useSupabaseUpdate('form_templates');

  useEffect(() => {
    if (data) {
      setFormTemplate(data);
      setIsLoading(false);
    }
  }, [data]);

  const handleSaveTemplate = async () => {
    if (!formTemplate) return;
    
    setIsSaving(true);
    try {
      await updateTemplate({
        id: formTemplate.id,
        name: formTemplate.name,
        description: formTemplate.description,
        fields: formTemplate.fields,
        is_public: formTemplate.is_public,
        is_global: formTemplate.is_global,
        form_type: formTemplate.form_type,
        category: formTemplate.category,
      });
      
      toast({
        title: "Form template saved",
        description: "Your form template has been updated successfully."
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast({
        title: "Error saving template",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: '',
      required: false,
    };

    if (type === 'select' || type === 'radio' || type === 'checkbox') {
      newField.options = [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' }
      ];
    }

    setFieldBeingEdited(newField);
    setIsFieldDialogOpen(true);
  };

  const saveField = (field: FormField) => {
    if (!formTemplate) return;
    
    const existingIndex = formTemplate.fields.findIndex(f => f.id === field.id);
    let updatedFields;
    
    if (existingIndex >= 0) {
      // Update existing field
      updatedFields = [...formTemplate.fields];
      updatedFields[existingIndex] = field;
    } else {
      // Add new field
      updatedFields = [...formTemplate.fields, field];
    }
    
    setFormTemplate({
      ...formTemplate,
      fields: updatedFields
    });
    
    setIsFieldDialogOpen(false);
    setFieldBeingEdited(null);
  };

  const deleteField = (fieldId: string) => {
    if (!formTemplate) return;
    
    setFormTemplate({
      ...formTemplate,
      fields: formTemplate.fields.filter(f => f.id !== fieldId)
    });
  };

  const editField = (field: FormField) => {
    setFieldBeingEdited({...field});
    setIsFieldDialogOpen(true);
  };

  const moveField = (sourceIndex: number, destinationIndex: number) => {
    if (!formTemplate || sourceIndex === destinationIndex) return;
    
    const updatedFields = [...formTemplate.fields];
    const [removed] = updatedFields.splice(sourceIndex, 1);
    updatedFields.splice(destinationIndex, 0, removed);
    
    setFormTemplate({
      ...formTemplate,
      fields: updatedFields
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    moveField(result.source.index, result.destination.index);
  };

  if (isLoading || !formTemplate) {
    return <div className="flex items-center justify-center h-64">Loading form template...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Form Name</Label>
              <Input 
                id="name"
                value={formTemplate.name}
                onChange={(e) => setFormTemplate({...formTemplate, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formTemplate.category || ''}
                onValueChange={(value) => setFormTemplate({...formTemplate, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={formTemplate.description || ''}
              onChange={(e) => setFormTemplate({...formTemplate, description: e.target.value})}
              rows={3}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_public"
                checked={formTemplate.is_public}
                onCheckedChange={(checked) => 
                  setFormTemplate({...formTemplate, is_public: checked as boolean})
                }
              />
              <Label htmlFor="is_public">Public Form</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_global"
                checked={formTemplate.is_global}
                onCheckedChange={(checked) => 
                  setFormTemplate({...formTemplate, is_global: checked as boolean})
                }
              />
              <Label htmlFor="is_global">Global Form (all associations)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="fields">Form Fields</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fields" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Form Fields</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select onValueChange={(value: FormFieldType) => addField(value as FormFieldType)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Add Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Field</SelectItem>
                    <SelectItem value="textarea">Text Area</SelectItem>
                    <SelectItem value="email">Email Field</SelectItem>
                    <SelectItem value="phone">Phone Field</SelectItem>
                    <SelectItem value="number">Number Field</SelectItem>
                    <SelectItem value="date">Date Field</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="radio">Radio Buttons</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="default" onClick={() => addField('text')}>
                  <Plus className="h-4 w-4 mr-2" /> Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formTemplate.fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No fields yet. Add your first field to start building your form.</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {formTemplate.fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-md p-3 flex items-center justify-between bg-background hover:bg-secondary/20"
                              >
                                <div className="flex items-center space-x-3">
                                  <div {...provided.dragHandleProps} className="cursor-move">
                                    <MoveUp className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{field.label}</p>
                                    <p className="text-sm text-muted-foreground capitalize">{field.type} {field.required && '(Required)'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="ghost" onClick={() => editField(field)}>
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => deleteField(field.id)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <FormPreview form={formTemplate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onComplete}>Cancel</Button>
        <Button onClick={handleSaveTemplate} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Form Template'}
        </Button>
      </div>

      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{fieldBeingEdited?.id ? 'Edit Field' : 'Add Field'}</DialogTitle>
          </DialogHeader>
          {fieldBeingEdited && (
            <FieldEditor 
              field={fieldBeingEdited} 
              onChange={(field) => setFieldBeingEdited(field)} 
              onSave={saveField}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface FieldEditorProps {
  field: FormField;
  onChange: (field: FormField) => void;
  onSave: (field: FormField) => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onChange, onSave }) => {
  const [currentField, setCurrentField] = useState<FormField>(field);

  useEffect(() => {
    setCurrentField(field);
  }, [field]);

  const handleChange = (updates: Partial<FormField>) => {
    const updated = { ...currentField, ...updates };
    setCurrentField(updated);
    onChange(updated);
  };

  const addOption = () => {
    if (!currentField.options) return;
    
    const newOption = { 
      label: `Option ${currentField.options.length + 1}`, 
      value: `option_${currentField.options.length + 1}` 
    };
    
    handleChange({ 
      options: [...currentField.options, newOption] 
    });
  };

  const updateOption = (index: number, label: string, value: string) => {
    if (!currentField.options) return;
    
    const updatedOptions = [...currentField.options];
    updatedOptions[index] = { label, value };
    
    handleChange({ options: updatedOptions });
  };

  const removeOption = (index: number) => {
    if (!currentField.options) return;
    
    handleChange({
      options: currentField.options.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Field Label</Label>
        <Input 
          id="label"
          value={currentField.label}
          onChange={(e) => handleChange({ label: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder (optional)</Label>
        <Input 
          id="placeholder"
          value={currentField.placeholder || ''}
          onChange={(e) => handleChange({ placeholder: e.target.value })}
        />
      </div>
      
      {(currentField.type === 'select' || currentField.type === 'radio' || currentField.type === 'checkbox') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button size="sm" type="button" variant="outline" onClick={addOption}>
              <Plus className="h-3 w-3 mr-1" /> Add Option
            </Button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {currentField.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input 
                  value={option.label}
                  onChange={(e) => updateOption(index, e.target.value, option.value)}
                  placeholder="Option label"
                  className="flex-1"
                />
                <Input 
                  value={option.value}
                  onChange={(e) => updateOption(index, option.label, e.target.value)}
                  placeholder="Value"
                  className="w-24 shrink-0"
                />
                <Button 
                  size="icon" 
                  variant="ghost"
                  type="button"
                  onClick={() => removeOption(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="required"
          checked={currentField.required}
          onCheckedChange={(checked) => handleChange({ required: checked })}
        />
        <Label htmlFor="required">Required field</Label>
      </div>
      
      <DialogFooter>
        <Button type="button" onClick={() => onSave(currentField)}>
          Save Field
        </Button>
      </DialogFooter>
    </div>
  );
};
