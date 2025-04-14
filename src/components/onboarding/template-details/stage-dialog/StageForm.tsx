
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface StageFormData {
  name: string;
  description: string;
  estimated_days: number;
}

interface StageFormProps {
  formData: StageFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const StageForm: React.FC<StageFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="edit-stage-name">Stage Name</Label>
        <Input
          id="edit-stage-name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter stage name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-stage-description">Description</Label>
        <Textarea
          id="edit-stage-description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Enter stage description"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-stage-days">Estimated Days</Label>
        <Input
          id="edit-stage-days"
          name="estimated_days"
          type="number"
          min="0"
          value={formData.estimated_days}
          onChange={onInputChange}
          placeholder="Enter estimated days"
        />
      </div>
    </div>
  );
};

export default StageForm;
