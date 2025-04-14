
import React from 'react';
import { FormStepProps } from '@/types/proposal-request-types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const FormStepThree: React.FC<FormStepProps> = ({ formData, onChange, errors }) => {
  // Show different fields based on the project type
  const showBidRequestType = !['CPA', 'Engineer'].includes(formData.projectType);
  const showWorkLocation = ['Electrician', 'HVAC', 'Painting', 'Pest Control', 'Plumbing', 'Locksmith', 'Power Washing', 'Leak Detection', 'Construction (Big Projects)'].includes(formData.projectType);
  const showCpaService = formData.projectType === 'CPA';
  const showRoadWorkTypes = formData.projectType === 'Street Repairs / Paving / Striping';
  const showFenceLocation = formData.projectType === 'Fencing';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Project Details</h3>
      
      {showBidRequestType && (
        <div className="space-y-2">
          <Label>Type of Bid Request</Label>
          <RadioGroup 
            value={formData.bidRequestType || ''} 
            onValueChange={(value) => onChange('bidRequestType', value)}
            className="flex flex-col space-y-1"
          >
            {['Maintenance / Repair', 'Service Contract', 'Construction / New Build'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`bid-type-${type}`} />
                <Label htmlFor={`bid-type-${type}`}>{type}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      
      {showWorkLocation && (
        <div className="space-y-2">
          <Label>Location of the Work <span className="text-red-500">*</span></Label>
          <RadioGroup 
            value={formData.workLocation || ''} 
            onValueChange={(value) => onChange('workLocation', value)}
            className="flex flex-col space-y-1"
          >
            {['Exterior (outside of unit)', 'Interior (inside of unit)', 'Both'].map(location => (
              <div key={location} className="flex items-center space-x-2">
                <RadioGroupItem value={location} id={`work-location-${location}`} />
                <Label htmlFor={`work-location-${location}`}>{location}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.workLocation && (
            <p className="text-sm text-red-500">{errors.workLocation}</p>
          )}
        </div>
      )}
      
      {showCpaService && (
        <div className="space-y-2">
          <Label>CPA Service Requested</Label>
          <RadioGroup 
            value={formData.cpaService || ''} 
            onValueChange={(value) => onChange('cpaService', value)}
            className="flex flex-col space-y-1"
          >
            {['Financial Review', 'Financial Audit'].map(service => (
              <div key={service} className="flex items-center space-x-2">
                <RadioGroupItem value={service} id={`cpa-service-${service}`} />
                <Label htmlFor={`cpa-service-${service}`}>{service}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      
      {showRoadWorkTypes && (
        <div className="space-y-2">
          <Label>Type of Road Work Needed (Check all that apply) <span className="text-red-500">*</span></Label>
          <div className="flex flex-col space-y-2">
            {['Road Repair', 'Road Re-Paving', 'Striping'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={`road-work-${type}`} 
                  checked={(formData.roadWorkTypes || []).includes(type)}
                  onCheckedChange={(checked) => {
                    const currentTypes = formData.roadWorkTypes || [];
                    const newTypes = checked 
                      ? [...currentTypes, type] 
                      : currentTypes.filter(t => t !== type);
                    onChange('roadWorkTypes', newTypes);
                  }}
                />
                <Label htmlFor={`road-work-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
          {errors.roadWorkTypes && (
            <p className="text-sm text-red-500">{errors.roadWorkTypes}</p>
          )}
        </div>
      )}
      
      {showFenceLocation && (
        <div className="space-y-2">
          <Label>Location of Fence <span className="text-red-500">*</span></Label>
          <RadioGroup 
            value={formData.fenceLocation || ''} 
            onValueChange={(value) => onChange('fenceLocation', value)}
            className="flex flex-col space-y-1"
          >
            {['Exterior Community Fence', 'Pool Fence', 'Park or Dog Park Fence', 'Other'].map(location => (
              <div key={location} className="flex items-center space-x-2">
                <RadioGroupItem value={location} id={`fence-location-${location}`} />
                <Label htmlFor={`fence-location-${location}`}>{location}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.fenceLocation && (
            <p className="text-sm text-red-500">{errors.fenceLocation}</p>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="additionalDetails">Additional Details</Label>
        <Textarea
          id="additionalDetails"
          placeholder="Provide any additional information about your project needs..."
          value={formData.additionalDetails || ''}
          onChange={(e) => onChange('additionalDetails', e.target.value)}
          className="h-32"
        />
      </div>
    </div>
  );
};

export default FormStepThree;
