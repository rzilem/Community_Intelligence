
import React, { useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { FormField } from "@/types/form-builder-types";
import SortableFieldItem from "./SortableFieldItem";

interface FieldsManagerProps {
  fields: FormField[];
  onReorder: (activeId: string, overId: string) => void;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onAddField: () => void;
}

const FormTemplateFieldsManager: React.FC<FieldsManagerProps> = ({
  fields,
  onReorder,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onAddField,
}) => {
  // For brevity, just show the list - drag & drop wiring happens in parent (FormTemplateEditor)
  return (
    <div>
      {fields.map((field) => (
        <SortableFieldItem key={field.id} field={field}>
          <button onClick={() => onDeleteField(field.id)} className="ml-4 text-destructive">Delete</button>
        </SortableFieldItem>
      ))}
      <button onClick={onAddField} className="mt-2 px-2 py-1 bg-muted rounded">Add Field</button>
    </div>
  );
};

export default FormTemplateFieldsManager;
