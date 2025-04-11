
import React from 'react';
import { Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DataTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Data Type to Import</h3>
      <RadioGroup
        defaultValue={value}
        onValueChange={onChange}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        <DataTypeOption 
          id="associations" 
          label="Associations" 
        />
        <DataTypeOption 
          id="properties_owners" 
          label="Properties & Owners" 
          tooltip="Import both properties and their owners in a single process" 
        />
        <DataTypeOption 
          id="owners" 
          label="Owners/Residents" 
        />
        <DataTypeOption 
          id="properties" 
          label="Properties" 
        />
        <DataTypeOption 
          id="financial" 
          label="Financial Data"
          tooltip="Import financial data including assessments, payments, and transactions" 
        />
        <DataTypeOption 
          id="compliance" 
          label="Compliance Issues" 
        />
        <DataTypeOption 
          id="maintenance" 
          label="Maintenance Requests" 
        />
        <DataTypeOption 
          id="vendors" 
          label="Vendors"
          tooltip="Import vendor data including contact information and service categories" 
        />
      </RadioGroup>
    </div>
  );
};

interface DataTypeOptionProps {
  id: string;
  label: string;
  tooltip?: string;
}

const DataTypeOption: React.FC<DataTypeOptionProps> = ({ id, label, tooltip }) => {
  return (
    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
      <RadioGroupItem value={id} id={id} />
      <Label htmlFor={id} className="flex-1 cursor-pointer">
        {label}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground inline" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
    </div>
  );
};

export default DataTypeSelector;
