
import { useState } from "react";
import type { FormField, FormTemplate } from "@/types/form-builder-types";

export function useFormTemplateState(initialTemplate: FormTemplate | null) {
  const [template, setTemplate] = useState<FormTemplate | null>(initialTemplate);

  const updateField = (updatedField: FormField) => {
    setTemplate((prev) =>
      prev
        ? {
            ...prev,
            fields: prev.fields.map((f) =>
              f.id === updatedField.id ? updatedField : f
            ),
          }
        : prev
    );
  };

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(7),
      type: "text",
      label: "New Field",
      required: false,
    };
    setTemplate((prev) =>
      prev ? { ...prev, fields: [...prev.fields, newField] } : prev
    );
    return newField.id;
  };

  const deleteField = (id: string) => {
    setTemplate((prev) =>
      prev
        ? { ...prev, fields: prev.fields.filter((f) => f.id !== id) }
        : prev
    );
  };

  const updateTemplateDetails = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTemplate((prev) =>
      prev ? { ...prev, [name]: value } : prev
    );
  };

  const updateIsPublic = (checked: boolean) => {
    setTemplate((prev) => (prev ? { ...prev, is_public: checked } : prev));
  };

  const reorderFields = (activeId: string, overId: string) => {
    setTemplate((prev) => {
      if (!prev) return prev;
      const activeIndex = prev.fields.findIndex((f) => f.id === activeId);
      const overIndex = prev.fields.findIndex((f) => f.id === overId);
      if (activeIndex === -1 || overIndex === -1) return prev;
      const { arrayMove } = require("@dnd-kit/sortable");
      return {
        ...prev,
        fields: arrayMove(prev.fields, activeIndex, overIndex)
      };
    });
  };

  return {
    template,
    setTemplate,
    updateField,
    addField,
    deleteField,
    updateTemplateDetails,
    updateIsPublic,
    reorderFields,
  };
}
