
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { HomeownerRequestPriority } from '@/types/homeowner-request-types';

interface RequestPrioritySelectProps {
  value: HomeownerRequestPriority;
  onChange: (value: HomeownerRequestPriority) => void;
  disabled?: boolean;
}

const RequestPrioritySelect: React.FC<RequestPrioritySelectProps> = ({ 
  value, 
  onChange,
  disabled = false
}) => {
  return (
    <Select 
      value={value} 
      onValueChange={(val) => onChange(val as HomeownerRequestPriority)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default RequestPrioritySelect;
