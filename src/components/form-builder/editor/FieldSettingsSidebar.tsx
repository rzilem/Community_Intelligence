
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormField, FormTemplate } from "@/types/form-builder-types";
import FormFieldEditor from "../FormFieldEditor";

interface FieldSettingsSidebarProps {
  selectedFieldId: string | null;
  template: FormTemplate;
  onFieldChange: (field: FormField) => void;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Settings</CardTitle>
        <CardDescription>Customize the settings for the selected field.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormFieldEditor
          field={selectedField}
          onChange={onFieldChange}
          onDelete={() => onDeleteField(selectedFieldId)}
        />
      </CardContent>
    </Card>
  );
};

export default FieldSettingsSidebar;
