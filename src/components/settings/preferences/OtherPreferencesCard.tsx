
import React from 'react';
import { Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface OtherPreferencesCardProps {
  autoSave: boolean;
  onAutoSaveChange: (enabled: boolean) => void;
}

const OtherPreferencesCard: React.FC<OtherPreferencesCardProps> = ({
  autoSave,
  onAutoSaveChange
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <CardTitle>Other Preferences</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="autoSave">Auto-save changes</Label>
          <Switch 
            id="autoSave" 
            checked={autoSave}
            onCheckedChange={onAutoSaveChange} 
          />
        </div>
        
      </CardContent>
    </Card>
  );
};

export default OtherPreferencesCard;
