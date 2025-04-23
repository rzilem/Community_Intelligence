
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface RequestDescriptionFieldProps {
  form: UseFormReturn<any>;
}

const RequestDescriptionField: React.FC<RequestDescriptionFieldProps> = ({ form }) => {
  // Function to decode HTML entities when displaying in textarea
  const decodeHtmlEntities = (value: string): string => {
    if (!value) return '';
    try {
      const textArea = window.document.createElement('textarea');
      if (textArea.innerHTML !== undefined) {
        textArea.innerHTML = value;
        return textArea.value || value;
      }
      return value;
    } catch (error) {
      console.error('Error decoding HTML entities:', error);
      return value; // Return original value if decoding fails
    }
  };

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => {
        // Get the raw value from the form
        const rawValue = field.value || '';
        
        // Decode any HTML entities in the value
        const decodedValue = decodeHtmlEntities(rawValue);
        
        return (
          <FormItem>
            <FormControl>
              <Textarea 
                {...field}
                value={decodedValue}
                onChange={(e) => {
                  // Update the form with the user's input
                  field.onChange(e.target.value);
                }}
                placeholder="Request description" 
                className="min-h-[120px] h-[120px] resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default RequestDescriptionField;
