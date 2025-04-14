
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormFieldInput from '@/components/homeowners/form/FormFieldInput';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import BidRequestCategorySelector from './BidRequestCategorySelector';

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
      
      <div className="grid grid-cols-1 gap-4">
        <BidRequestCategorySelector form={form} />
        
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
