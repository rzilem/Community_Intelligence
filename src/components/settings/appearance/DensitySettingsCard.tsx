
import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DensityOption } from '@/types/settings-types';

interface DensitySettingsCardProps {
  value: DensityOption;
  onChange: (density: DensityOption) => void;
}

const DensitySettingsCard: React.FC<DensitySettingsCardProps> = ({ value, onChange }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <CardTitle>Density</CardTitle>
        </div>
        <CardDescription>Adjust the density of the user interface</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={value} 
          onValueChange={(density) => onChange(density as DensityOption)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compact" id="compact" />
            <Label htmlFor="compact">Compact</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="default" />
            <Label htmlFor="default">Default</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="comfortable" />
            <Label htmlFor="comfortable">Comfortable</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default DensitySettingsCard;
