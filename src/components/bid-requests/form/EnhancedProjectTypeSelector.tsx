
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
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

// Define the form data interface to match what BidRequestForm uses
interface BidRequestFormData {
  hoa_id: string;
  title: string;
  description: string;
  location: string;
  number_of_bids_wanted: number;
  project_type_id: string;
  category: string;
  project_details: Record<string, any>;
  special_requirements?: string;
  selected_vendor_ids: string[];
  allow_public_bidding: boolean;
  budget_range_min?: number;
  budget_range_max?: number;
  preferred_start_date?: string;
  required_completion_date?: string;
  bid_deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: File[];
  created_by: string;
  status: 'draft' | 'published';
}

interface EnhancedProjectTypeSelectorProps {
  form: UseFormReturn<BidRequestFormData>;
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
