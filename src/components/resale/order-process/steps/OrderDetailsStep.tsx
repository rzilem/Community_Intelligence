
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface OrderDetailsStepProps {
  formData: any;
  onInputChange: (section: string, field: string, value: string) => void;
}

export const OrderDetailsStep = ({ formData, onInputChange }: OrderDetailsStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Processing Time</Label>
        <RadioGroup 
          value={formData.orderDetails.rushOption}
          onValueChange={(value) => onInputChange('orderDetails', 'rushOption', value)}
          className="grid grid-cols-1 gap-4 mt-2"
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard">Standard Processing (3-5 business days)</Label>
          </div>
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="rush" id="rush" />
            <Label htmlFor="rush">Rush Processing (1-2 business days) +$100</Label>
          </div>
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="super-rush" id="super-rush" />
            <Label htmlFor="super-rush">Super Rush Processing (Same day) +$200</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="closingDate">Closing Date</Label>
        <Input
          type="date"
          id="closingDate"
          value={formData.orderDetails.closingDate}
          onChange={(e) => onInputChange('orderDetails', 'closingDate', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          value={formData.orderDetails.additionalNotes}
          onChange={(e) => onInputChange('orderDetails', 'additionalNotes', e.target.value)}
          placeholder="Enter any additional information or special requests"
          rows={4}
        />
      </div>
    </div>
  );
};
