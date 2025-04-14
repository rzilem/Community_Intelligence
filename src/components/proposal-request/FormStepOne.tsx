
import React from 'react';
import { FormStepProps } from '@/types/proposal-request-types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Community names from the JSON
const communityNames = [
  '2000 Lightsey Condominiums', 
  '3114 SOCO Condos', 
  '5708 Sutherlin',
  '900 Cielo Apts',
  'Aberdeen Terrace',
  'Alexan Springdale',
  'Amber Oaks',
  'Amberwood',
  'Aria',
  'Ashley',
  'Avonlea West',
  'Bauerle Ranch'
  // Add all options from the JSON...
];

const FormStepOne: React.FC<FormStepProps> = ({ formData, onChange, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Community Information</h3>
      
      <div className="space-y-2">
        <Label htmlFor="communityName">Community Name <span className="text-red-500">*</span></Label>
        <Select 
          value={formData.communityName} 
          onValueChange={(value) => onChange('communityName', value)}
        >
          <SelectTrigger id="communityName">
            <SelectValue placeholder="Select a community" />
          </SelectTrigger>
          <SelectContent>
            {communityNames.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.communityName && (
          <p className="text-sm text-red-500">{errors.communityName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfBids">Number of Bids Needed <span className="text-red-500">*</span></Label>
        <Select 
          value={formData.numberOfBids} 
          onValueChange={(value) => onChange('numberOfBids', value)}
        >
          <SelectTrigger id="numberOfBids">
            <SelectValue placeholder="Select number of bids" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map(num => (
              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.numberOfBids && (
          <p className="text-sm text-red-500">{errors.numberOfBids}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Address <span className="text-red-500">*</span></Label>
        <div className="space-y-3">
          <div>
            <Input
              placeholder="Street Address"
              value={formData.address.streetAddress}
              onChange={(e) => onChange('address.streetAddress', e.target.value)}
            />
            {errors['address.streetAddress'] && (
              <p className="text-sm text-red-500">{errors['address.streetAddress']}</p>
            )}
          </div>
          
          <Input
            placeholder="Address Line 2 (Optional)"
            value={formData.address.addressLine2}
            onChange={(e) => onChange('address.addressLine2', e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="City"
                value={formData.address.city}
                onChange={(e) => onChange('address.city', e.target.value)}
              />
              {errors['address.city'] && (
                <p className="text-sm text-red-500">{errors['address.city']}</p>
              )}
            </div>
            
            <div>
              <Input
                placeholder="ZIP / Postal Code"
                value={formData.address.zipCode}
                onChange={(e) => onChange('address.zipCode', e.target.value)}
              />
              {errors['address.zipCode'] && (
                <p className="text-sm text-red-500">{errors['address.zipCode']}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStepOne;
