
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';

interface RequestNoteFieldProps {
  form: UseFormReturn<any>;
}

const RequestNoteField: React.FC<RequestNoteFieldProps> = ({ form }) => {
  return (
    <FormFieldTextarea
      form={form}
      name="note"
      label="Add Note"
      placeholder="Enter a note about this request..."
      rows={3}
    />
  );
};

export default RequestNoteField;
