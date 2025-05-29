
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { useProjectTypes } from '@/hooks/bid-requests/useProjectTypes';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnhancedProjectTypeSelectorProps {
  form: UseFormReturn<Partial<BidRequestWithVendors>>;
  onChange?: (projectTypeId: string, categorySlug: string) => void;
}

const EnhancedProjectTypeSelector: React.FC<EnhancedProjectTypeSelectorProps> = ({ form, onChange }) => {
  const { data: projectTypes, isLoading } = useProjectTypes();

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project Type</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              if (onChange) {
                const selectedType = projectTypes?.find(type => type.slug === value);
                if (selectedType) {
                  onChange(selectedType.id, value);
                }
              }
            }}
            defaultValue={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a project type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {projectTypes?.map((type) => (
                <SelectItem key={type.id} value={type.slug}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EnhancedProjectTypeSelector;
