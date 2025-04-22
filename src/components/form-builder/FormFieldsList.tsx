
import React from 'react';
import { FormField } from '@/types/form-builder-types';
import { List, ListItem } from '@/components/ui/list';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface FormFieldsListProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onAddField: () => void;
}

const FormFieldsList: React.FC<FormFieldsListProps> = ({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onAddField,
}) => {
  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-2">No fields added yet</p>
          <Button onClick={onAddField} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add First Field
          </Button>
        </div>
      ) : (
        <>
          <List className="space-y-1">
            {fields.map((field) => (
              <ListItem
                key={field.id}
                className={`flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer ${
                  selectedFieldId === field.id ? 'bg-muted' : ''
                }`}
                onClick={() => onSelectField(field.id)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{field.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({field.type})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteField(field.id);
                  }}
                  className="h-7 w-7 opacity-50 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </ListItem>
            ))}
          </List>
          <Button onClick={onAddField} size="sm" variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </>
      )}
    </div>
  );
};

export default FormFieldsList;
