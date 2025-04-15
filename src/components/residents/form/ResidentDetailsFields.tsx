
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { ResidentWithProfile } from '@/types/app-types';
import { ResidentInputField } from './ResidentInputField';

interface ResidentDetailsFieldsProps {
  register: UseFormRegister<Partial<ResidentWithProfile>>;
}

const ResidentDetailsFields: React.FC<ResidentDetailsFieldsProps> = ({
  register
}) => {
  return (
    <>
      <ResidentInputField
        id="move_in_date"
        label="Move-in Date"
        type="date"
        register={register}
        name="move_in_date"
      />
      
      <ResidentInputField
        id="move_out_date"
        label="Move-out Date"
        type="date"
        register={register}
        name="move_out_date"
      />
      
      <ResidentInputField
        id="emergency_contact"
        label="Emergency Contact"
        placeholder="Name: (123) 456-7890"
        register={register}
        name="emergency_contact"
      />
    </>
  );
};

export default ResidentDetailsFields;
