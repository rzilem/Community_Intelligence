
import React from 'react';
import { Input } from '@/components/ui/input';
import { ResidentFormField } from './ResidentFormField';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface ResidentInputFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  register: UseFormRegister<any>;
  name: string;
  rules?: any;
  error?: FieldError;
}

export const ResidentInputField: React.FC<ResidentInputFieldProps> = ({
  id,
  label,
  placeholder,
  type = 'text',
  register,
  name,
  rules,
  error
}) => {
  return (
    <ResidentFormField id={id} label={label} error={error?.message}>
      <Input 
        id={id} 
        type={type}
        placeholder={placeholder}
        {...register(name, rules)}
      />
    </ResidentFormField>
  );
};
