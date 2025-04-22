
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { HomeownerRequestStatus } from '@/types/homeowner-request-types';

interface RequestStatusSelectProps {
  value: HomeownerRequestStatus;
  onChange: (value: HomeownerRequestStatus) => void;
  disabled?: boolean;
}

const RequestStatusSelect: React.FC<RequestStatusSelectProps> = ({ 
  value, 
  onChange,
  disabled = false
}) => {
  return (
    <Select 
      value={value} 
      onValueChange={(val) => onChange(val as HomeownerRequestStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default RequestStatusSelect;
