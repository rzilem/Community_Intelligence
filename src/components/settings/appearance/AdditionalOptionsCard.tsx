
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AdditionalOptionsCardProps {
  animationsEnabled: boolean;
  onChange: (enabled: boolean) => void;
}

const AdditionalOptionsCard: React.FC<AdditionalOptionsCardProps> = ({ 
  animationsEnabled, 
  onChange 
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Additional Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="animations">Enable animations</Label>
          <Switch 
            id="animations" 
            checked={animationsEnabled}
            onCheckedChange={onChange} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalOptionsCard;
