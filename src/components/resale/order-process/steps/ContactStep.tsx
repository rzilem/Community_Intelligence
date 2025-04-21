
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ContactStepProps {
  formData: any;
  onInputChange: (section: string, field: string, value: string) => void;
}

export const ContactStep = ({ formData, onInputChange }: ContactStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Your Role</Label>
        <RadioGroup 
          value={formData.contactInfo.role}
          onValueChange={(value) => onInputChange('contactInfo', 'role', value)}
          className="grid grid-cols-2 gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="title-company" id="title-company" />
            <Label htmlFor="title-company">Title Company</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="real-estate-agent" id="real-estate-agent" />
            <Label htmlFor="real-estate-agent">Real Estate Agent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="law-office" id="law-office" />
            <Label htmlFor="law-office">Law Office</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name"
            value={formData.contactInfo.name}
            onChange={(e) => onInputChange('contactInfo', 'name', e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input 
            id="company"
            value={formData.contactInfo.company}
            onChange={(e) => onInputChange('contactInfo', 'company', e.target.value)}
            placeholder="Your company name"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email"
            value={formData.contactInfo.email}
            onChange={(e) => onInputChange('contactInfo', 'email', e.target.value)}
            placeholder="Your email address"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone"
            value={formData.contactInfo.phone}
            onChange={(e) => onInputChange('contactInfo', 'phone', e.target.value)}
            placeholder="Your phone number"
            required
          />
        </div>
      </div>
    </div>
  );
};
