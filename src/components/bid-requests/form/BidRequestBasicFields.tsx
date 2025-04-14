
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormFieldInput from '@/components/homeowners/form/FormFieldInput';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import FormFieldSelect from '@/components/homeowners/form/FormFieldSelect';
import { BidRequestWithVendors } from '@/types/bid-request-types';

interface BidRequestBasicFieldsProps {
  form: UseFormReturn<Partial<BidRequestWithVendors>>;
}

const BidRequestBasicFields: React.FC<BidRequestBasicFieldsProps> = ({ form }) => {
  return (
    <>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldSelect
          form={form}
          name="category"
          label="Category"
          placeholder="Select category"
          options={[
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'construction', label: 'Construction' },
            { value: 'landscaping', label: 'Landscaping' },
          ]}
        />
        
        <FormFieldInput
          form={form}
          name="budget"
          label="Budget"
          placeholder="Enter budget"
          type="number"
        />
      </div>
    </>
  );
};

export default BidRequestBasicFields;
