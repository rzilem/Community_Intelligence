
import React from 'react';
import { Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeSelector from '@/components/settings/ThemeSelector';
import { ThemeOption } from '@/types/settings-types';

interface ThemeSettingsCardProps {
  value: ThemeOption;
  onChange: (theme: ThemeOption) => void;
}

const ThemeSettingsCard: React.FC<ThemeSettingsCardProps> = ({ value, onChange }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Theme</CardTitle>
        </div>
        <CardDescription>Choose a theme for the application interface</CardDescription>
      </CardHeader>
      <CardContent>
        <ThemeSelector value={value} onChange={onChange} />
      </CardContent>
    </Card>
  );
};

export default ThemeSettingsCard;
