
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface RequestNoteFieldProps {
  form: any;
  compact?: boolean;
}

const RequestNoteField: React.FC<RequestNoteFieldProps> = ({ form, compact = false }) => {
  return (
    <FormField
      control={form.control}
      name="note"
      render={({ field }) => (
        <FormItem>
          {!compact && (
            <FormLabel>Add Note (Optional)</FormLabel>
          )}
          <FormControl>
            <Textarea 
              placeholder="Add a note or comment about this update..." 
              className={compact ? "min-h-[80px]" : "min-h-[120px]"}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RequestNoteField;
