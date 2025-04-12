
import React from 'react';
import { Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ColorSchemeSelector from '@/components/settings/ColorSchemeSelector';
import { ColorScheme } from '@/types/settings-types';

interface ColorSchemeSettingsCardProps {
  value: ColorScheme;
  onChange: (colorScheme: ColorScheme) => void;
}

const ColorSchemeSettingsCard: React.FC<ColorSchemeSettingsCardProps> = ({ value, onChange }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <CardTitle>Color Scheme</CardTitle>
        </div>
        <CardDescription>Select a color scheme for the application</CardDescription>
      </CardHeader>
      <CardContent>
        <ColorSchemeSelector value={value} onChange={onChange} />
      </CardContent>
    </Card>
  );
};

export default ColorSchemeSettingsCard;
