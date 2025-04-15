
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ResidentWithProfile } from '@/types/app-types';
import { ResidentInputField } from './ResidentInputField';

interface ResidentBasicFieldsProps {
  register: UseFormRegister<Partial<ResidentWithProfile>>;
  errors: FieldErrors<Partial<ResidentWithProfile>>;
}

const ResidentBasicFields: React.FC<ResidentBasicFieldsProps> = ({
  register,
  errors
}) => {
  return (
    <>
      <ResidentInputField
        id="name"
        label="Name"
        placeholder="John Doe"
        register={register}
        name="name"
        rules={{ required: 'Name is required' }}
        error={errors.name}
      />
      
      <ResidentInputField
        id="email"
        label="Email"
        type="email"
        placeholder="john@example.com"
        register={register}
        name="email"
        rules={{ 
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address"
          }
        }}
        error={errors.email}
      />
      
      <ResidentInputField
        id="phone"
        label="Phone"
        placeholder="(123) 456-7890"
        register={register}
        name="phone"
      />
    </>
  );
};

export default ResidentBasicFields;
