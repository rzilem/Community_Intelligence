
import React from 'react';
import { Palette, Type, LayoutGrid, Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import ThemeSelector from '@/components/settings/ThemeSelector';
import ColorSchemeSelector from '@/components/settings/ColorSchemeSelector';
import { AppearanceSettings, DensityOption } from '@/types/settings-types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSystemSetting, useUpdateSystemSetting } from '@/hooks/settings/use-system-settings';
import { Skeleton } from '@/components/ui/skeleton';

interface AppearanceTabProps {
  settings: AppearanceSettings;
  onChange: (settings: Partial<AppearanceSettings>) => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({ settings, onChange }) => {
  // We can also use the direct hooks if we want to bypass the parent component
  // const { data: settings, isLoading } = useSystemSetting<AppearanceSettings>('appearance');
  // const { mutate: updateSettings } = useUpdateSystemSetting<AppearanceSettings>('appearance');
  
  // If we decide to load data directly in the component:
  // if (isLoading) {
  //   return <AppearanceTabSkeleton />;
  // }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Theme</CardTitle>
          </div>
          <CardDescription>Choose a theme for the application interface</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector 
            value={settings.theme} 
            onChange={(theme) => onChange({ theme })} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle>Color Scheme</CardTitle>
          </div>
          <CardDescription>Select a color scheme for the application</CardDescription>
        </CardHeader>
        <CardContent>
          <ColorSchemeSelector 
            value={settings.colorScheme} 
            onChange={(colorScheme) => onChange({ colorScheme })} 
          />
        </CardContent>
      </Card>

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
            value={settings.density} 
            onValueChange={(density) => onChange({ density: density as DensityOption })}
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <CardTitle>Text Size</CardTitle>
          </div>
          <CardDescription>Adjust the size of text throughout the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs">A</span>
              <Slider 
                min={0.8} 
                max={1.2} 
                step={0.05} 
                value={[settings.fontScale]}
                onValueChange={(value) => onChange({ fontScale: value[0] })}
                className="w-[calc(100%-4rem)]" 
              />
              <span className="text-lg">A</span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: `${settings.fontScale}rem` }}>
              Sample text size at {Math.round(settings.fontScale * 100)}%
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Additional Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="animations">Enable animations</Label>
            <Switch 
              id="animations" 
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => onChange({ animationsEnabled: checked })} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Skeleton component that can be used when loading data
const AppearanceTabSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i}>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default AppearanceTab;
