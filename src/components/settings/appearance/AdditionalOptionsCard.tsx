
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AdditionalOptionsCardProps {
  animationsEnabled: boolean;
  showAuthDebugger: boolean;
  onChange: (key: 'animationsEnabled' | 'showAuthDebugger', value: boolean) => void;
}

const AdditionalOptionsCard: React.FC<AdditionalOptionsCardProps> = ({
  animationsEnabled,
  showAuthDebugger,
  onChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Options</CardTitle>
        <CardDescription>
          Additional display and interface options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="animations">Enable Animations</Label>
            <p className="text-sm text-muted-foreground">
              Turn on or off interface animations and transitions
            </p>
          </div>
          <Switch
            id="animations"
            checked={animationsEnabled}
            onCheckedChange={(checked) => onChange('animationsEnabled', checked)}
          />
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auth-debugger">Show Auth Debug Panel</Label>
              <p className="text-sm text-muted-foreground">
                Display the authentication debugger panel (development only)
              </p>
            </div>
            <Switch
              id="auth-debugger"
              checked={showAuthDebugger}
              onCheckedChange={(checked) => onChange('showAuthDebugger', checked)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalOptionsCard;
