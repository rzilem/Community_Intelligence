
import React from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormField } from "@/types/form-builder-types";

interface SortableFieldItemProps {
  field: FormField;
  children?: React.ReactNode;
}
const SortableFieldItem: React.FC<SortableFieldItemProps> = ({ field, children }) => {
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
      {children}
    </div>
  );
};
export default SortableFieldItem;
