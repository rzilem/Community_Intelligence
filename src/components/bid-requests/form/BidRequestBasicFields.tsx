
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormFieldInput from '@/components/homeowners/form/FormFieldInput';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import EnhancedProjectTypeSelector from './EnhancedProjectTypeSelector';

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

interface BidRequestBasicFieldsProps {
  form: UseFormReturn<BidRequestFormData>;
}

const BidRequestBasicFields: React.FC<BidRequestBasicFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <FormFieldInput
        form={form}
        name="title"
        label="Title"
        placeholder="Enter bid request title"
      />
      
      <FormFieldTextarea
        form={form}
        name="description"
        label="Description"
        placeholder="Provide details about the bid request"
      />
      
      <EnhancedProjectTypeSelector form={form} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldInput
          form={form}
          name="budget_range_min"
          label="Minimum Budget"
          placeholder="Enter minimum budget"
          type="number"
        />
        
        <FormFieldInput
          form={form}
          name="budget_range_max"
          label="Maximum Budget"
          placeholder="Enter maximum budget"
          type="number"
        />
      </div>
    </div>
  );
};

export default BidRequestBasicFields;
