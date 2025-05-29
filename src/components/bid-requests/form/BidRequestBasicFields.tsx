
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormFieldInput from '@/components/homeowners/form/FormFieldInput';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import EnhancedProjectTypeSelector from './EnhancedProjectTypeSelector';

interface BidRequestBasicFieldsProps {
  form: UseFormReturn<Partial<BidRequestWithVendors>>;
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
