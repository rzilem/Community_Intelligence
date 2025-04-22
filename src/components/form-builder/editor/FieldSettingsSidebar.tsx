
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormField, FormTemplate } from "@/types/form-builder-types";
import FormFieldEditor from "../FormFieldEditor";

interface FieldSettingsSidebarProps {
  selectedFieldId: string | null;
  template: FormTemplate;
  onFieldChange: (updatedField: FormField) => void;
  onDeleteField: (id: string) => void;
}

const FieldSettingsSidebar: React.FC<FieldSettingsSidebarProps> = ({
  selectedFieldId,
  template,
  onFieldChange,
  onDeleteField,
}) => {
  const selectedField = template.fields.find((field) => field.id === selectedFieldId);

  if (!selectedFieldId || !selectedField) return null;

  const handleFieldChange = (updates: Partial<FormField>) => {
    const updatedField = { ...selectedField, ...updates };
    onFieldChange(updatedField);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Settings</CardTitle>
        <CardDescription>Customize the settings for the selected field.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormFieldEditor
          field={selectedField}
          onChange={handleFieldChange}
          onDelete={() => onDeleteField(selectedFieldId)}
          allFields={template.fields}
        />
      </CardContent>
    </Card>
  );
};

export default FieldSettingsSidebar;
