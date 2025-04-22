
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { HomeownerRequestType } from '@/types/homeowner-request-types';

interface RequestTypeSelectProps {
  value: HomeownerRequestType;
  onChange: (value: HomeownerRequestType) => void;
  disabled?: boolean;
}

const RequestTypeSelect: React.FC<RequestTypeSelectProps> = ({ 
  value, 
  onChange,
  disabled = false
}) => {
  return (
    <Select 
      value={value} 
      onValueChange={(val) => onChange(val as HomeownerRequestType)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="compliance">Compliance</SelectItem>
          <SelectItem value="billing">Billing</SelectItem>
          <SelectItem value="general">General</SelectItem>
          <SelectItem value="amenity">Amenity</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default RequestTypeSelect;
