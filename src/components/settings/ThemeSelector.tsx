
import React from 'react';
import { Check, Moon, Sun, Laptop } from 'lucide-react';
import { ThemeOption } from '@/types/settings-types';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  value: ThemeOption;
  onChange: (theme: ThemeOption) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ value, onChange }) => {
  const themes: { value: ThemeOption; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="h-5 w-5" />,
      description: 'Light mode for daytime use'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="h-5 w-5" />,
      description: 'Dark mode for nighttime use'
    },
    {
      value: 'system',
      label: 'System',
      icon: <Laptop className="h-5 w-5" />,
      description: 'Follows your system preferences'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {themes.map((theme) => (
        <div 
          key={theme.value}
          className={cn(
            "relative flex flex-col items-center gap-2 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors",
            value === theme.value ? "border-primary bg-primary/5" : "border-border"
          )}
          onClick={() => onChange(theme.value)}
        >
          {value === theme.value && (
            <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
          )}
          <div className={cn(
            "mb-2 rounded-full p-2",
            value === theme.value ? "bg-primary/20" : "bg-muted"
          )}>
            {theme.icon}
          </div>
          <Label htmlFor={theme.value} className="font-medium">{theme.label}</Label>
          <p className="text-xs text-muted-foreground text-center">{theme.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ThemeSelector;
