
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
    { value: 'teal', label: 'Teal', color: 'bg-hoa-teal' },
    { value: 'slate', label: 'Slate', color: 'bg-slate-600' },
    { value: 'cyan', label: 'Cyan', color: 'bg-cyan-600' }
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {colorSchemes.map((scheme) => (
        <button
          key={scheme.value}
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
      ))}
    </div>
  );
};

export default ColorSchemeSelector;
