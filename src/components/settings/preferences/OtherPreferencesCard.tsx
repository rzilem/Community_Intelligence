
import React from 'react';
import { Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface OtherPreferencesCardProps {
  autoSave: boolean;
  sessionTimeout: number;
  onAutoSaveChange: (enabled: boolean) => void;
  onSessionTimeoutChange: (timeout: number) => void;
}

const OtherPreferencesCard: React.FC<OtherPreferencesCardProps> = ({ 
  autoSave, 
  sessionTimeout,
  onAutoSaveChange,
  onSessionTimeoutChange
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
        
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
          <Input 
            id="sessionTimeout" 
            type="number"
            min="5"
            max="480"
            value={sessionTimeout}
            onChange={(e) => onSessionTimeoutChange(parseInt(e.target.value, 10))}
            className="max-w-[180px]"
          />
          <p className="text-xs text-muted-foreground">
            Set how long users can be inactive before being logged out
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OtherPreferencesCard;
