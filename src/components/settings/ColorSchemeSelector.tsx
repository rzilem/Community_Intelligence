
import React from 'react';
import { Check } from 'lucide-react';
import { ColorScheme } from '@/types/settings-types';
import { cn } from '@/lib/utils';

interface ColorSchemeSelectorProps {
  value: ColorScheme;
  onChange: (scheme: ColorScheme) => void;
}

const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({ value, onChange }) => {
  const colorSchemes: { value: ColorScheme; label: string; color: string }[] = [
    { value: 'default', label: 'Default Blue', color: 'bg-hoa-blue-600' },
    { value: 'blue', label: 'Royal Blue', color: 'bg-blue-700' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-600' },
    { value: 'green', label: 'Green', color: 'bg-green-600' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-600' },
    { value: 'teal', label: 'Teal', color: 'bg-teal-600' },
    { value: 'slate', label: 'Slate', color: 'bg-slate-600' },
    { value: 'cyan', label: 'Cyan', color: 'bg-cyan-600' }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {colorSchemes.map((scheme) => (
        <div key={scheme.value} className="flex flex-col items-center gap-2">
          <button
            type="button"
            className={cn(
              "relative rounded-full overflow-hidden h-10 w-10 flex items-center justify-center border-2 transition-all",
              value === scheme.value ? "border-black dark:border-white scale-110" : "border-transparent hover:scale-105"
            )}
            onClick={() => onChange(scheme.value)}
            aria-label={`Select ${scheme.label} theme`}
          >
            <span className={`h-full w-full ${scheme.color}`} />
            {value === scheme.value && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                <Check className="h-4 w-4 text-white" />
              </span>
            )}
          </button>
          <span className="text-xs text-center text-muted-foreground">{scheme.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ColorSchemeSelector;
