
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormFieldInput from './FormFieldInput';
import FormFieldSelect from './FormFieldSelect';
import { HomeownerRequestType, HomeownerRequestPriority } from '@/types/homeowner-request-types';

interface RequestBasicInfoFieldsProps {
  form: UseFormReturn<any>;
}

const RequestBasicInfoFields = ({ form }: RequestBasicInfoFieldsProps) => {
  const requestTypeOptions = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'billing', label: 'Billing' },
    { value: 'general', label: 'General' },
    { value: 'amenity', label: 'Amenity' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="space-y-4">
      <FormFieldInput
        form={form}
        name="title"
        label="Title"
        placeholder="Enter request title"
      />
      
      <FormFieldSelect
        form={form}
        name="type"
        label="Request Type"
        placeholder="Select type"
        options={requestTypeOptions}
      />
      
      <FormFieldSelect
        form={form}
        name="priority"
        label="Priority"
        placeholder="Select priority"
        options={priorityOptions}
      />
    </div>
  );
};

export default RequestBasicInfoFields;
