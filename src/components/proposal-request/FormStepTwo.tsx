
import React from 'react';
import { FormStepProps } from '@/types/proposal-request-types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';

// Project type options with images
const projectTypeOptions = [
  { value: 'Access System', label: 'Access System', image: '/placeholder.svg' },
  { value: 'Appliance Repair', label: 'Appliance Repair', image: '/placeholder.svg' },
  { value: 'Arborist', label: 'Arborist', image: '/placeholder.svg' },
  { value: 'CPA', label: 'CPA', image: '/placeholder.svg' },
  { value: 'Electrician', label: 'Electrician', image: '/placeholder.svg' },
  { value: 'Engineer', label: 'Engineer', image: '/placeholder.svg' },
  { value: 'Fencing', label: 'Fencing', image: '/placeholder.svg' },
  { value: 'HVAC', label: 'HVAC', image: '/placeholder.svg' },
  { value: 'Painting', label: 'Painting', image: '/placeholder.svg' },
  { value: 'Pest Control', label: 'Pest Control', image: '/placeholder.svg' },
  { value: 'Plumbing', label: 'Plumbing', image: '/placeholder.svg' },
  { value: 'Locksmith', label: 'Locksmith', image: '/placeholder.svg' },
  { value: 'Power Washing', label: 'Power Washing', image: '/placeholder.svg' },
  { value: 'Leak Detection', label: 'Leak Detection', image: '/placeholder.svg' },
  { value: 'Construction (Big Projects)', label: 'Construction', image: '/placeholder.svg' },
  { value: 'Street Repairs / Paving / Striping', label: 'Street Repairs', image: '/placeholder.svg' }
  // Add all options from the JSON...
];

const FormStepTwo: React.FC<FormStepProps> = ({ formData, onChange, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Project Type</h3>
      
      <div className="space-y-2">
        <Label>Select a Project Type <span className="text-red-500">*</span></Label>
        
        <RadioGroup 
          value={formData.projectType} 
          onValueChange={(value) => onChange('projectType', value)}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {projectTypeOptions.map(option => (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value}
                id={`project-type-${option.value}`}
                className="sr-only"
              />
              <Label
                htmlFor={`project-type-${option.value}`}
                className="cursor-pointer"
              >
                <Card className={`overflow-hidden transition-all ${formData.projectType === option.value ? 'ring-2 ring-primary' : 'hover:bg-accent'}`}>
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={option.image} 
                      alt={option.label} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-2 text-center">{option.label}</div>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {errors.projectType && (
          <p className="text-sm text-red-500">{errors.projectType}</p>
        )}
      </div>
    </div>
  );
};

export default FormStepTwo;
