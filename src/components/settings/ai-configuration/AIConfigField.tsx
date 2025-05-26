
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AIConfigFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  description: string;
  min?: string;
  max?: string;
  step?: string;
}

export function AIConfigField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  description,
  min,
  max,
  step
}: AIConfigFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
